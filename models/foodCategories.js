import {model, Schema } from "mongoose";
const FoodCatSchema = new Schema({
    name:{type: String, required:true},
})

//create a model
let FoodCatModel = model("FoodCat", FoodCatSchema)
export {FoodCatModel}
