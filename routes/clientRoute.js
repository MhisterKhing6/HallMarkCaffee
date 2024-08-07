import { Router } from "express";
import { ClientController } from "../controllers/clientController.js";
import { PaymentController } from "../controllers/paymentController.js";
import { UserModel } from "../models/user.js";
import { decodeToken, getAuthorizationtoken } from "../utils/WebTokenController.js";
import { erroReport } from "../utils/errors.js";

let clientRoute = Router()

clientRoute.use(async(req, res, next) => {
    let token = getAuthorizationtoken(req)
    if(!token)
        return erroReport(res, 401, "unAuth")
    let details  = decodeToken(token) 
    if(!details)
        return erroReport(res, 401, "expiredSes")
    let user = await UserModel.findById(details.id)
    if(!user)
        return erroReport(res, 400, "unAuth")
    if(user.role !== "customer")
        return erroReport(res, 400, "unAuth")
    req.user = user
    next()

})
/**
 * adds client address
 * method: post
 * domain: restricted to clients
 */
clientRoute.post("/address", ClientController.addAddress)

/**
 * view foods
 * method: get
 * domain:client and users
 */

/**
 * post order with  food item
 * method: post
 * domain: client
 */
clientRoute.post('/order', ClientController.accumulateOrder)

/**
 * view foods not delivered
 * method: post
 * domain: client
 */
clientRoute.get('/order', ClientController.OrderNotDelivered)

/**
 * edit order
 * method: put
 * u
 */
clientRoute.put("/order", ClientController.editOrder)


/**
 * get food items for a an order
 * method: get
 */

clientRoute.get("/order/:orderId", ClientController.orderItems)

/**
 * get enabled foods
 * method:get
 */
clientRoute.post("/food", ClientController.searchFood)

/**
 * payment gateways
 * method:get
 * the authorization url for payment and access codes
 */
clientRoute.get("/payment-gateway/:orderId", PaymentController.startPayment)

/**
 * check transaction status
 * method:get
 */
clientRoute.get("/payment/status/:reference", PaymentController.checkTransaction)

export { clientRoute };
