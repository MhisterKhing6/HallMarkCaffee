import { Schema, Types, model } from "mongoose";
let Order = new Schema({
    customerId: {type:Types.ObjectId, required:true},
    createdAt : {type:Date, default:Date.now()},
    totalPrice : {type:Number, default:0},
    status : {type:String, enum:["preparing", "on delivery", "cancelled", "delivered"]},
    expectedDate: {type:Date, required:true},
    day: {type:String, required: true},
}
)

//create a model
let OrderModel = model("Order", Order)

//return model
export { OrderModel };

