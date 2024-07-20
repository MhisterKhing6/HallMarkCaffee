import mongoose from "mongoose";
import configuration from "config"
import AutoIncrement from "mongoose-sequence"

const connection = mongoose.createConnection(configuration.MONGO_URI, {autoIndex:true})
const connectDb = async () => {
    /**
     * connectDb : Connect database to mongodb instance
     * @param{string} connctionString: authentication string for database
     * returns: exit program execution if failed to connect else nothing otherwise
     */
    try {
        let onlinUrl = process.env.MONGO_URI
        if(onlinUrl) {
            await mongoose.connect(onlinUrl, {autoIndex:true})
        } else {
            await mongoose.connect(configuration.MONGO_URI, {autoIndex:true})
        }
        console.log("connected to database")
    } catch(err){
        console.log(err)
        process.exit(1)
    }
    
}
let AutoIncrementPlugin = AutoIncrement(connection)
export {connectDb, AutoIncrementPlugin}
