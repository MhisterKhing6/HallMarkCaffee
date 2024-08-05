/* 
controls user endpoints operations
*/
/*handles user controller functions */
import generatePassword from "generate-password"
import sha1 from "sha1"
import { UserModel } from "../models/user.js"
import { sendEmailVerification, sendResetPassword } from "../utils/EmailHandler.js"
import { generateToken } from "../utils/WebTokenController.js"
import { erroReport } from "../utils/errors.js"
import { generateSecretNumber, TwoHourPass } from "../utils/VerificationFunctions.js"
import { VerifTokenModel } from "../models/verifyToken.js"
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
        if(!(["customer", "Dispatcher"].includes(userDetails.role)))
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
        //check if password has length greater than 8
        if(userDetails.password.length < 8)
            return res.status(400).json({message:"password length should have length greater than 8"})
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
        let newUser = {role:user._doc.role, name:user._doc.name, email:user._doc.email}
        let token = generateToken({email:user.email, id:user.id})
        //send token to user
        return res.status(200).json({token, "message": "login successful", user:newUser})

        }catch(err) {
            console.log(err)
            return erroReport(res, 501,"internalE")
        }   
    }

    //handle verification
    static sendVerificationNumber = async (req, res) => {
        /**
        * sendVerification : sends verification details to user email
        * @param {object} req: request object
        * @param {object} res: response
        */
       let userEmail = req.params.email
       try{
           //check if the user is registered
           let customer = await UserModel.findOne({email:userEmail})
           if(!customer)
               return res.status(401).json({"message": "user isn't registered"})
           //delete old verification entry
           await VerifTokenModel.deleteOne({"userId": customer._id.toString()})
           //generate verifcation entry and save
           let verficaitonDetails = {userId:customer._id.toString(), type:"password", verificationCode:generateSecretNumber()}
           let verificatonEntry = await new VerifTokenModel(verficaitonDetails).save()
           //check the type to determine the type of message to send
           sendResetPassword({email:customer.email, name:customer.name}, verficaitonDetails.verificationCode)
           //send verification id to user_id to user
           res.status(200).json({"verificationId":verificatonEntry._id.toString(), "userId":customer._id.toString()})
       }catch(err){
           console.log(err)
           res.status(501).json({"message": "internal server error"})
       }
   }

   static verify = async (req, res) => {
    /**
      * resetPassword : reset user passwords
      * @param {object} req: request object
      * @param {object} res: response
      */ 

    let verficationDetails = req.body    
     //check if all details fields are given
     if(!(verficationDetails.verificationId && verficationDetails.verificationCode))
          return res.status(400).json({"message": "fields missing"})
     try {
         //check for verification entry
         let verificationEntry = await VerifTokenModel.findById(verficationDetails.verificationId)
         if (!verificationEntry)
             return res.status(401).json({"message": "no verification entry found"})
         //check if token has expired
         if(TwoHourPass(verificationEntry.createdDate)) {
             //delete token entry
             await VerifTokenModel.deleteOne({_id: verificationEntry._id})
             return res.status(401).json({"message": "token expired"})
         }
         //check if user secrete number matches the one sent via email
         if(verficationDetails.verificationCode !== verificationEntry.verificationCode)
             return res.status(401).json({"message": "numbers dont match"})
         //update verification entry
         verificationEntry.verified = true
         await verificationEntry.save()
        
         return res.status(200).json({verificationId: verificationEntry._id.toString(), message:"success"})
         
     }catch(err) {
         console.log(err)
         res.status(501).json({"message": "internal server error"})
     }
 }

 static updatePassword = async (req, res) => {
    /**
     * updatePassword : update user passwords
     * @param {object} req: request object
     * @param {object} res: response
     */ 
    //update history
    let updateDetials = req.body
    //check if all user detials are given
    if(!(updateDetials.password && updateDetials.verificationId))
        return res.status(400).json({"message": "fields missing"})
    //check for verifcation database entry
    try {
        //check for verification entry
        let verificationEntry = await VerifTokenModel.findById(updateDetials.verificationId)
        if(!verificationEntry)
            return res.status(401).json({"message": "no verification entry found"})
        //check if user has verify and the type of verification is reset password
        if(!(verificationEntry.verified))
            return res.status(401).json({"message": "user not verfied"})
        //get and verify user
        let user = await UserModel.findById(verificationEntry.userId)
        if(!user)
            return await  res.status(401).json({"message": "user not registered"})
        //update user's password
        user.passwordHash = sha1(updateDetials.password)
        await user.save()
        //delete token entry
        await VerifTokenModel.deleteOne({_id:verificationEntry._id})
        //return response to user
        return res.status(200).json({id: user._id.toString() , "message": "password changed"})
    }catch(err) {
        console.log(err)
        res.status(501).json({"message": "internal server error"})
    }

}
}

export { UserController }
