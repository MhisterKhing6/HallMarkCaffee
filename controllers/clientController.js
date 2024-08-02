import { UserAddressModel } from "../models/address.js"
import { FoodModel } from "../models/food.js"
import { OrderItemModel } from "../models/orderItem.js"
import { OrderModel } from "../models/orders.js"
import { OrderPaymentModel } from "../models/payment.js"
import { ExtraFundModel } from "../models/refund.js"
import { addDays, dateOfDay } from "../utils/datesHandler.js"
import { paymentGateWay } from "../utils/paymentGateway.js"


class ClientController {
    /**
     * adds user address
     * @param {object} req 
     * @param {object} res 
     * @returns json object
     */
    static addAddress = async (req, res) => {
        //
        let addressinfo = req.body
        if(!(addressinfo.addressLine1 && addressinfo.city && addressinfo.town && addressinfo.addAddress))
            return erroReport(res, 401, "allFields")
        //save information to the database
        let response = await new UserAddressModel(addressinfo).save()
        return res.status(200).json("address added")
    }


    static accumulateOrder = async (req, res) => {
        let orderDetail = req.body
        if(!(orderDetail.paymentMode && orderDetail.totalPrice && orderDetail.items)) {
            res.status(400).json({"message": "not all fields given"})
        }

        let orders = []
        let orderItems = []
        let payment = new OrderPaymentModel({mode:orderDetail.paymentMode, expectedAmount:orderDetail.totalPrice})

        //save the information in a list
        for(const key of Object.keys(orderDetail.items)) {
            if(!["totalPrice", "paymentMode"].includes(key)) {
                let day = orderDetail.items[key]
                //form order model
                if(day.items.length !== 0) { //check if day has value
                    let orderSingle = new OrderModel({paymentId:payment._id,customerId:req.user._id, day:key, expectedDate:day.date })
                    for(const food of day.items) {
                        let orderItem = new OrderItemModel({foodId:food._id.toString(), orderId:orderSingle._id, unitPrice:food.price, size:food.size, name:food.name, quantity:food.quantity})
                        orderSingle.totalPrice += (food.price * food.quantity)
                        orderItems.push(orderItem.save())
                    }
                    orders.push(orderSingle.save())
                }    //form day and order item
            }
        }
        let output = {message:"success"}
            //check if payment is online
            if(orderDetail.paymentMode === "online") {
                //initiate payment to paystack
                let amountInPeswas = orderDetail.totalPrice * 100
                //get user email
                let userObject = {email:req.user.email, amount:amountInPeswas}
                let response = await paymentGateWay("/transaction/initialize", userObject)
                //check status
                if(response.status !== 200)
                    return res.status(501).json({"message":"server side error"})
                output = response.data.data
                payment.reference = response.data.data.reference
                payment.accessCode = response.data.data.access_code
                payment.urlPayment = response.data.data.authorization_url
            }
        await Promise.all([payment.save(), ...orders, ...orderItems]) //save all order entries
        return res.status(200).json(output)
    }
    static order = async (req, res) => {
        //order items {day:day, paymentMode:cash:online orderItems:[{foodId:quantity, price}, {foodId:quantity, price}]}
        let orderDetails = req.body
        //form food order
        if(!(orderDetails.paymentMode && orderDetails.totalPrice && orderDetails.items))
            return res.status(400).json({"message": "not all fields given"})
        //get date of the day of order
        let expectedDate = dateOfDay(orderDetails.day)

        let order = await (new OrderModel({customerId:req.user._id, expectedDate, day:orderDetails.day}))
        
        //calculate total price
        let totalPrice = 0
        //from order items model
        let modelOrder = orderDetails.orderItems.map(orderItems => {
            totalPrice += orderItems.unitPrice * orderItems.quantity
            return new OrderItemModel({foodId:orderItems.foodId, quantity:orderItems.quantity, orderId:order._id, unitPrice: orderItems.unitPrice}).save()
        })
        order.totalPrice = totalPrice
        //make payment entry
        let paymentEntry = OrderPaymentModel({orderId:order._id, mode:orderDetails.paymentMode}).save()
        //save orders and order items
        await Promise.all([order.save(), ...modelOrder, paymentEntry])
        return res.status(200).json({"message": "orders saved"})
    }

    /**
     * view user orders
     */
    static OrderNotDelivered = async (req, res) => {
        //get customers orders where status is not delivered
        let customersOrders = await OrderModel.find({$and:[{customerId:req.user._id}, {status:{$nin: ['cancelled', 'delivered']}}]}).select("-__v").lean()
        //check if the customer can edit order or not
        let customerOrdersWithEditStatus = customersOrders.map((order) => {
                //check if current date plus 3 days is less then expected date
                if(addDays(3) <= order.expectedDate){
                    order.edit = true
                } else {
                    order.edit = false
                }
                return order
        })
        let ordersWithItem = []
        for(const order of customerOrdersWithEditStatus) {
        let orderItems = await OrderItemModel.find({orderId:order._id}).select("_id name quantity size unitPrice").lean()
        order.items = orderItems
        ordersWithItem.push(order)
    }
        return res.status(200).json(ordersWithItem)
    }

    static editOrder = async (req, res) => {
        /*{orderId:Id, 
        orderObject:{
        day:Tuesday, 
        orderItems: [
        {orderItemId:"id", action:delete},
        {unitPrice: float, quantity: int, action:add },
        {orderItemId:"id", unitPrice: float, quantity: int, action:update}
        ]
            }
        } */
        let details = req.body
        if(!(details.orderId))
            return res.status(400).json({"message": "bad order id"})
        let order = await OrderModel.findById(details.orderId)
        if(!order)
            return res.status(400).json({mesage: "not order entry found for orderId given"})
        let payMent = await OrderPaymentModel.findById(order.paymentId)
        let totalPrice = order.totalPrice
        let editedPrice = 0
        //check if the user requested for date change
        if(details.orderItems) {
            for(const orderItemDetails of details.orderItems) {
                //check the action of order
                if(orderItemDetails.action === "add") {
                    //form order item
                    let orderItem = new OrderItemModel({foodId:orderItemDetails._id.toString(),orderId:order._id, unitPrice:orderItemDetails.price,size:orderItemDetails.size, name:orderItemDetails.name, quantity:orderItemDetails.quantity})
                    //add new order item price to order
                    order.totalPrice += orderItemDetails.price * orderItemDetails.quantity
                    //edited price
                    editedPrice = order.totalPrice
                    //save order and order item
                    await Promise.all([order.save(), orderItem.save()])
                } else {
                //find order Item
                if(!orderItemDetails.itemId)
                    return res.status(400).json({message: `edit action ${orderItemDetails.action} requires item id`})
                let orderItem = await OrderItemModel.findById(orderItemDetails.itemId)
                if (!orderItem) 
                    return res.status(400).json({message: "no order item with such id found under order"})
                //subtract the price of the order items from the order
                let price = orderItem.unitPrice * orderItem.quantity
                editedPrice = order.totalPrice
                //check if the condition is to delete order
                if(orderItemDetails.action === "delete") {
                    //save order and delete OrderItemModel
                    let deletedOrder = await OrderItemModel.findByIdAndDelete(orderItem._id)
                    order.totalPrice = order.totalPrice - (deletedOrder.unitPrice * deletedOrder.quantity)
                    editedPrice = order.totalPrice
                    Promise.all([order.save()])
                }
                else {
                    //update the entries
                    orderItem.quantity = orderItemDetails.quantity
                    //add the changed price to order
                    order.totalPrice -= price
                    order.totalPrice += orderItem.quantity * orderItemDetails.price
                    //save update
                    editedPrice = order.totalPrice
                    //save the changes
                    await Promise.all([orderItem.save(), order.save()])
                        }
                    }
                }
            }
        
        //check for refund logic here
        let output = {"message": 'changes saved', updatedPrice: totalPrice}
        if(editedPrice && (editedPrice !== totalPrice)) {
            payMent.expectedAmount = (payMent.expectedAmount - totalPrice) + editedPrice
            let refund = false
            let amount = 0
            if(payMent.status !== "payed") {
                if(totalPrice > editedPrice) {
                    amount = totalPrice - editedPrice
                } else {
                    amount = editedPrice - totalPrice
                    refund = true
                }
                if(refund)
                    output.owing = -amount
                else 
                    output.owing = amount
                await ExtraFundModel.deleteOne({orderId:details.orderId})            
                let exFund = new ExtraFundModel({orderId:order._id, customerId:req.user._id, refund, amount})
                //check if mode is online 
                if(payMent.mode === "online") {
                    //issue a payment receipt
                    let amountInPeswas = amount * 100
                //get user email
                let userObject = {email:req.user.email, amount:amountInPeswas}
                let response = await paymentGateWay("/transaction/initialize", userObject)
                //check status
                if(response.status !== 200)
                    return res.status(501).json({"message":"server side error"})
                output.paymentGateway = response.data.data
                exFund.reference = response.data.data.reference
                exFund.accessCode = response.data.data.access_code
                exFund.urlPayment = response.data.data.authorization_url
                }
                await exFund.save()
            }
                

        }
        return res.status(200).json({"orderId": order._id, ...output})
    }

    static orderItems = async (req, res)=>{
        //get order id
        let orderId = req.params.orderId
        //find all order item that have given id
        let orderItems = await OrderItemModel.find({orderId}).lean().select("-__v")
        //get the food name and size associated with the order item
        const orderWithFood = []
        for(const orderItem of orderItems) {
            //find the food with id
            /*let food = await FoodModel.findById(orderItem.foodId).lean().select("-_id -__v name size url price")
            if(food)
                orderItem.food = food
            orderWithFood.push(orderItem) */
        }
        return res.status(200).json(orderItems)
    }

    static searchFood = async(req, res) => {
        //search for food
        let foodPattern = req.body.pattern
        let enabledFood = null
        if(!foodPattern){
            //returns all foods items that are enabled
            enabledFood = await FoodModel.find({"enabled":true}).select("-__v").lean()
            //return foods
            //that are available
        }
        else {
            //search for meals that has pattern in them
            enabledFood = await FoodModel.find({"enabled":true, name: {"$regex": foodPattern, "$options": "i"}}).select("-__v").lean()
        }
        return res.status(200).json(enabledFood)
    }
}

export { ClientController }
