import { Schema, Types, model } from "mongoose";
const ExtraFund = new Schema({
    reference:{type: String},
    amount: {type:Number},
    date: {type:Date},
    urlPayment: {type:String},
    accessCode : {type:String},
    orderId : {type:Types.ObjectId},
    customerId : {type:Types.ObjectId},
    status: {type:String, default:"payed"},
    refund: {type:Boolean}

})


//create a model{}
let ExtraFundModel = model("extrafunds", ExtraFund)
export { ExtraFundModel };

