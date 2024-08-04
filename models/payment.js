import { Schema, Types, model } from "mongoose";
const OrderPaymentSchema = new Schema({
    reference:{type: String},
    status: {type:String, default:"not payed"},
    date: {type:Date, default:new Date()},
    accessCodes: {type:String},
    urlPayment: {type:String},
    accessCode : {type:String},
    payedAmount: {type:Number},
    expectedAmount: {type:Number},
    orders: [{type:Types.ObjectId, ref:"Order"}],
    customerId: {type:Types.ObjectId, ref:"User"},
    mode: {type:String, required:true},
})


//create a model{}
let OrderPaymentModel = model("OrderPayment", OrderPaymentSchema)
export { OrderPaymentModel };

