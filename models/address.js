import {model, Schema } from "mongoose";
const UserAddressSchema = new Schema({
    addressLine1:{type: String, required:true},
    addressLine2:{type: String},
    town: {type:String, require: true},
    address: {type:String, require: true},
    city: {type:String, required:true},
    gps: {type:String},
    userId: {type:String, required:true}
})

//create a model
let UserAddressModel = model("UserAddress", UserAddressSchema)
export {UserAddressModel}
