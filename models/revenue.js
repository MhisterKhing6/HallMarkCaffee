import { Schema, Types, model } from "mongoose";
const RevenueSchema = new Schema({
    totalOrder:{type: Number},
    totalCashPayed: {type:Number},
    totalCancelledOrder: {type:Number},
})


//create a model
let RevenueModel = model("Revenue", RevenueSchema)
export { RevenueModel };

