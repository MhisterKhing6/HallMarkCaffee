import { Schema, Types, model } from "mongoose";
const OrderItemSchema = new Schema({
    unitPrice:{type: Number, required:true},
    foodId: {type:String, required:true},
    quantity: {type:Number, required: true},
    orderId: {type:Types.ObjectId, required: true},
    name: {type:String},
    size: {type:String}
})


//create a model
let OrderItemModel = model("OrderItem", OrderItemSchema)
export { OrderItemModel };

