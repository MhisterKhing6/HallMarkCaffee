import {model, Types, Schema } from "mongoose";
const OrderItemSchema = new Schema({
    customerId: {type:Types.ObjectId, required:true},
    orderId: {type:Types.ObjectId, required: true},
    createdAt : {type:Date, default:Date.now()},
    status : {type:String, required:true, enum:["delivered", "preparing", "on delivery", "cancelled", "delivered"]},
    
})


//create a model
let OrderItemModel = model("OrderItem", OrderItemSchema)
export {OrderItemModel}
