import { model, Schema } from "mongoose";
const ActivitiesSchema = new Schema({
    message:{type: String, required:true},
    customerName:{type:String, required:true},
    date: {type:Date, default:new Date()},
})

//create a model
let ActivitiesModel = model("Activities", ActivitiesSchema)
export { ActivitiesModel };

