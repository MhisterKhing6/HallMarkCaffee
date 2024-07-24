import { UserAddressModel } from "../models/address.js"
import { FoodModel } from "../models/food.js"
import { FoodCatModel } from "../models/foodCategories.js"
import { OrderItemModel } from "../models/orderItem.js"
import { OrderModel } from "../models/orders.js"
import { addDays, dateOfDay } from "../utils/datesHandler.js"


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
    static order= async (req, res) => {
        //order items {day:day, orderItems:[{foodId:quantity, price}, {foodId:quantity, price}]}
        let orderDetails = req.body
        //form food order
        if(!(orderDetails.day && orderDetails.orderItems))
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
        //save orders and order items
        await Promise.all([order.save(), ...modelOrder])
        return res.status(200).json({"message": "orders saved"})
    }

    /**
     * view user orders
     */
    static OrderNotDelivered = async (req, res) => {
        //get customers orders where status is not delivered
        let customersOrders = await OrderModel.find({customerId:req.user._id}).select("-__v").lean()
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
        return res.status(200).json(customerOrdersWithEditStatus)
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
        let order = await OrderModel.findById(details.orderId)
        //check if the user requested for date change
        if(details.orderObject.day) {
            //update day and expected date
            let expectedDate = dateOfDay(details.orderObject.day)
            //get date of day and update expected date
            order.day = details.orderObject.day
            order.expectedDate = expectedDate
            await order.save()
        }
        if(details.orderObject.orderItems) {
            for(const orderItemDetails of details.orderObject.orderItems) {
                //check the action of order
                if(orderItemDetails.action === "add") {
                    //form order item
                    let orderItem = new OrderItemModel({foodId:"kofsi",orderId:order._id, unitPrice:orderItemDetails.unitPrice, quantity:orderItemDetails.quantity})
                    //add new order item price to order
                    order.totalPrice += orderItemDetails.unitPrice * orderItemDetails.quantity
                    //save order and order item
                    await Promise.all([order.save(), orderItem.save()])
                } else {
                //find order Item
                let orderItem = await OrderItemModel.findById(orderDetails._id)
                //subtract the price of the order items from the order
                let price = orderItem.unitPrice * orderItem.quantity
                order.totalPrice -= price
                //check if the condition is to delete order
                if(orderItemDetails.action === "delete") {
                    //save order and delete OrderItemModel
                    Promise.all([order.save(),OrderItemModel.findByIdAndDelete(orderItem._id)])
                }
                else {
                    //update the entries
                    orderItem.quantity = orderDetails.quantity
                    //add the changed price to order
                    order.price += orderItem.quantity * orderItem.unitPrice
                    //save the changes
                    await Promise.all([orderItem.save(), order.save()])
                }
            }
        }
    }
        //return response with orderId
        return res.status(200).json({"orderId": order._id})
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
            enabledFood = await FoodModel.find({enabled:true}).select("-__v").lean()
            //return foods
            //that are available
        }
        else {
            //search for meals that has pattern in them
            enabledFood = await FoodModel.find({name: {"$regex": foodPattern, "$options": "i"}}).select("-__v").lean()
        }
        return res.status(200).json(enabledFood)
    }
}

export { ClientController }
