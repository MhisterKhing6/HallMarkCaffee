/* 
controls user endpoints operations
*/
/*handles user controller functions */
import { UserModel } from "../models/user.js"
import { sendEmailVerification } from "../utils/EmailHandler.js"
import sha1 from "sha1"
import generatePassword from "generate-password"
import { erroReport } from "../utils/errors.js"
import { generateToken } from "../utils/WebTokenController.js"

class UserController  {

    static registerUser = async (req, res) => {
        /**
         * register: register user to the system
         * @param {object} req: request object
         * @param {object} res: responsea
         * @returns {object} : json response of user detials
         */
        let userDetails = req.body
        //check if all required user details are given
        if(!(userDetails.email && userDetails.name && userDetails.role))
            return erroReport(res, 400, "allFields")
        //check if is correct role
        if(!(["customer", "delivery"].includes(userDetails.role)))
            return erroReport(res, 400, false, "wrong user role, accepted roles [customer,delivery]")
        //check if the user is already register
        let alreadyUser = await UserModel.findOne({email: userDetails.email})
        if(alreadyUser)
            return erroReport(res, 400, "alregistered")        
        try {
            let password = generatePassword.generate({length:8, numbers:true})
            let passwordHash = sha1(password)
            let userDb = UserModel({name:userDetails.name, email:userDetails.email, passwordHash})
            //send verificaion message
            sendEmailVerification(userDb, password)
            //check if password is sent
            await userDb.save()
            //asynchroneously send verificatio message
            res.status(201).json({id: userDb._id})
        } catch(err) {
            console.log(err)
            return res.status(501).json({"message": "internal error"})
        }
    }

    static registerAdmin = async (req, res) => {
        /**
         * registerAdmin: registers an admin
         * @param {object} req: request object
         * @param {object} res: responsea
         * @returns {object} : json response of user detials
         */
        let userDetails = req.body
        //check if all required user details are given
        if(!(userDetails.email && userDetails.name && userDetails.password))
            return erroReport(res, 400, "allFields")
        //check if the user is already register
        let alreadyUser = await UserModel.findOne({email: userDetails.email})
        if(alreadyUser)
            return erroReport(res, 400, "alregistered")        
        try {
            let passwordHash = sha1(userDetails.password)
            let userDb = UserModel({name:userDetails.name, email:userDetails.email, passwordHash, role:"admin"})
            //check if password is sent
            await userDb.save()
            //asynchroneously send verificatio message
            res.status(201).json({id:userDb.id})
        } catch(err) {
            return  erroReport(res, 501, "internalE")
        }
    }

    static login = async (req, res) => {
        /**
         * register: register user to the system
         * @param {object} req: request object
         * @param {object} res: response
         * @return {object} : json response of user token
         */
        let loginDetails  = req.body
        //check if email and password is given
        try {
            if(!(loginDetails.email && loginDetails.password))
                return erroReport(res, 400, "allFields")
        //check if user has registered
        let user = await UserModel.findOne({email:loginDetails.email})
        if(!user)
            return erroReport(res, 401, "notRegistered")
        //check if user hash passwrod match login hash passsword
        if(user.passwordHash !== sha1(loginDetails.password))
            return erroReport(res, 400, "wrongPassword")
        //generate token for the user
        let token = generateToken({email:user.email, id:user.id})
        //send token to user
        return res.status(200).json({token, "message": "login successful"})

        }catch(err) {
            console.log(err)
            return erroReport(res, 501,"internalE")
        }   
    }
}

export {UserController}