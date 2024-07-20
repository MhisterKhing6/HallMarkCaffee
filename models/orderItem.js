import { Schema, Types, model } from "mongoose";
const OrderItemSchema = new Schema({
    unitPrice:{type: Types.Decimal128, required:true},
    foodId: {type:String, required:true},
    quantity: {type:Number, required: true},
    orderId: {type:Types.ObjectId, required: true},
})


//create a model
let OrderItemModel = model("OrderItem", OrderItemSchema)
export { OrderItemModel };

