import { Router } from "express";
import { decodeToken, getAuthorizationtoken } from "../utils/WebTokenController.js";
import { UserModel } from "../models/user.js";
import { erroReport } from "../utils/errors.js";
import { AdminController } from "../controllers/adminController.js";
import { ClientController } from "../controllers/clientController.js";

let clientRoute = Router()

clientRoute.use(async(req, res, next) => {
    let token = getAuthorizationtoken(req)
    if(!token)
        return erroReport(res, 401, "unAuth")
    let details  = decodeToken(token) 
    if(!details)
        return erroReport(res, 401, "expiredSes")
    let user = await UserModel.findById(details.id)
    if(user.role !== "client")
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

clientRoute.get("/food", AdminController.viewFoods)

export {clientRoute}