import { Schema, Types, model } from "mongoose";
let Order = new Schema({
    customerId: {type:Types.ObjectId, ref:"User"},
    createdAt : {type:Date, default:Date.now()},
    totalPrice : {type:Number, default:0},
    status : {type:String, enum:["preparing", "on delivery", "cancelled", "delivered"]},
    expectedDate: {type:Date, required:true},
    orderItems : [{type:Types.ObjectId, ref:"OrderItem"}],
    day: {type:String, required: true},
    paymentId:{type:Types.ObjectId, ref:"OrderPayment"},
    }
)

//create a model
let OrderModel = model("Order", Order)

//return model
export { OrderModel };

