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

/**
* sendVerification number
* method: get
* domain: public
*/
nonAuthRoute.get("/verification/code/:email", UserController.sendVerificationNumber)

/**
* sendVerification number
* method: post
* domain: public
*/
nonAuthRoute.post("/verify", UserController.verify)

/**
* update password
* method: post
* domain: public
*/
nonAuthRoute.post("/update/password", UserController.updatePassword)

/**
 * register user
 */
nonAuthRoute.post("/register/user", UserController.registerUser)

export { nonAuthRoute };
