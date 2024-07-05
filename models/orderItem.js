import {model, Types, Schema } from "mongoose";
const OrderItemSchema = new Schema({
    unitPrice:{type: Types.Decimal128, required:true},
    foodSizeId: {type:Types.ObjectId, required:true},
    quantity: {type:Types.Decimal128, required: true},
    orderId: {type:Types.ObjectId, required: true},
})


//create a model
let OrderItemModel = model("OrderItem", OrderItemSchema)
export {OrderItemModel}
