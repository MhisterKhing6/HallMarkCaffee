import {model, Schema, Types } from "mongoose";
const FoodSchema = new Schema({
    name:{type: String, required:true},
    description:{type:String, required:true},
    categoryId: {type:Types.ObjectId, required: true},
    allowedStartDate: {type:Date},
    allowedEndDate: {type:Date},
    url: {type:String, required:true}
})

//create a model
let FoodModel = model("Food", FoodSchema)
export {FoodModel}
