import { Router } from "express";
import { AdminController } from "../controllers/adminController.js";
import { ClientController } from "../controllers/clientController.js";
import { UserModel } from "../models/user.js";
import { decodeToken, getAuthorizationtoken } from "../utils/WebTokenController.js";
import { erroReport } from "../utils/errors.js";

let dispatcherRoute = Router()

dispatcherRoute.use(async(req, res, next) => {
    let token = getAuthorizationtoken(req)
    if(!token)
        return erroReport(res, 401, "unAuth")
    let details  = decodeToken(token) 
    if(!details)
        return erroReport(res, 401, "expiredSes")
    let user = await UserModel.findById(details.id)
    if(user.role !== "Dispatcher")
        return erroReport(res, 400, "unAuth")
    req.user = user
    next()

})
/**
 * adds user address
 * method: post
 * domain: restricted to clients
 */
dispatcherRoute.post("/address", ClientController.addAddress)

/**
 * search order
 */
dispatcherRoute.post("/search/order", AdminController.searchOrder)
/**
 * update order status
 * method: post
 * domain: client
 */
dispatcherRoute.post('/order-status', AdminController.updateOrder)



export { dispatcherRoute };
