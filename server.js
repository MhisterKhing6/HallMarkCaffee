import Express from "express";
import Cors from "cors"
import configuration from "config"
import { connectDb } from "./utils/MongodbConector.js";
import { nonAuthRoute } from "./routes/userRoute.js";
import { adminRoute } from "./routes/adminRoute.js";
import { clientRoute } from "./routes/clientRoute.js";
import { dispatcherRoute } from "./routes/dispatcherRoute.js";

//server initializing
const server = Express()

//connect to database
connectDb()

//middlewares
server.use(Cors()) //cross origin communication
server.use(Express.json({limit:"100mb"})) // json body parsing
server.use(Express.urlencoded({ extended: false }))
//static endpoints
server.use('/public',Express.static('public'))
//routes
server.use("/auth", nonAuthRoute)
//admin route
server.use('/admin', adminRoute)
//client route
server.use('/user', clientRoute)

//dispatcher
server.use("/dispatcher", dispatcherRoute)



const port = process.env.PORT || configuration.host.port
server.listen(port, () => {
    console.log(`app is listening at http://localhost:${port}`)
})

export {server}
