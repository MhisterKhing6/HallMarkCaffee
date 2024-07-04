import {model, Schema } from "mongoose";
const FileSchema = new Schema({
    filePath:  {type:String, required:true},
})

//create a model
let FileModel = model("File", FileSchema)
export {FileModel}
