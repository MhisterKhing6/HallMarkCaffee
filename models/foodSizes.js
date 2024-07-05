import {model, Types, Schema } from "mongoose";
const FoodSizeSchema = new Schema({
    name:{type: String, required:true},
    foodId: {type:Types.ObjectId, required:true},
    price: {type:Types.Decimal128, required: true},
})


//create a model
let FoodSizesModel = model("FoodSize", FoodSizeSchema)
export {FoodSizesModel}
