import { Schema, Types, model } from "mongoose";
const OrderPaymentSchema = new Schema({
    reference:{type: String},
    orderId: {type:Types.ObjectId, required: true},
    status: {type:String, default:"not payed"},
    date: {type:Date},
    accessCodes: {type:Date},
    urlPayment: {type:String},
    accessCode : {type:String},
    mode: {type:String, required:true}
})


//create a model
let OrderPaymentModel = model("OrderPayment", OrderPaymentSchema)
export { OrderPaymentModel };

