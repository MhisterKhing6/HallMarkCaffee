import { Schema, Types, model } from "mongoose";
const ExtraFund = new Schema({
    date: {type:Date, default:Date.now()},
    orderId : {type:Types.ObjectId},
    customerId : {type:Types.ObjectId},
    reason: {type:String},
    refund: {type:Boolean, default:false},
    paymentId: {type:Types.ObjectId},
    amount: {type:Number}

})


//create a model{}
let ExtraFundModel = model("extrafunds", ExtraFund)
export { ExtraFundModel };

