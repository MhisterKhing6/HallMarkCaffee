import { model, Schema } from "mongoose";
const FoodSchema = new Schema({
    name:{type: String, required:true},
    description:{type:String, required:true},
    url: {type:String, required:true},
    size:{type:String, required:true},
    price:{type:Number, required:true},
    special:{type:Boolean,default:false},
    day:{type:String},
    enabled: {type:Boolean, default:true}
})

//create a model
let FoodModel = model("Food", FoodSchema)
export { FoodModel };

