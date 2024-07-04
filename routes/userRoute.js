import { Router } from "express";
import { UserController } from "../controllers/userController.js";

let nonAuthRoute = Router()

/**
 register administrators to the system
* method: post
* domain: restricted to company selected users
*/
nonAuthRoute.post("/register/admin", UserController.registerAdmin)

/**
 register logs users into the system
* method: post
* domain: public
*/
nonAuthRoute.post("/login", UserController.login)


export {nonAuthRoute}