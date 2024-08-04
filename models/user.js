import {model, Schema, Types } from "mongoose";
const UserSchema = new Schema({
    name:{type: String, required:true},
    passwordHash: {type:String, required:true},
    email: {type:String, required: true, unique:true},
    profilePicPath : {type:String, required:false},
    emailVerified: {type:Boolean, required: true, default:false},
    orders : [{type:Types.ObjectId, ref:"Order" }],
    role: {type:String, require:true, enum:['customer', 'admin', "Dispatcher"], default:"customer"}
})

//create a model
let UserModel = model("User", UserSchema)
export {UserModel}
