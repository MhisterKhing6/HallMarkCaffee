import { Router } from "express";
import { decodeToken, getAuthorizationtoken } from "../utils/WebTokenController.js";
import { UserModel } from "../models/user.js";
import { erroReport } from "../utils/errors.js";
import { UserController } from "../controllers/userController.js";

let adminRoute = Router()

adminRoute.use(async(req, res, next) => {
    let token = getAuthorizationtoken(req)
    if(!token)
        return erroReport(res, 401, "unAuth")
    let details  = decodeToken(token) 
    if(!details)
        return erroReport(res, 401, "expiredSes")
    let user = await UserModel.findById(details.id)
    if(user.role !== "admin")
        return erroReport(res, 400, "unAuth")
    req.user = user
    next()

})
/**
 * register client or delivery guys to the system
 * method: post
 * domain: restricted to administrators
 */
adminRoute.post("/register/user", UserController.register)

export {adminRoute}