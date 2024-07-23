import moment from "moment"
import path from "path"
import { FoodModel } from "../models/food.js"
import { FoodCatModel } from "../models/foodCategories.js"
import { OrderModel } from "../models/orders.js"
import { UserModel } from "../models/user.js"
import { generateFileUrl, saveUpolaodFileDisk } from "../utils/FileHandler.js"
import { erroReport } from "../utils/errors.js"


/** Handle admin funtions*/
class AdminController {
    /**
     * upload Food Category
     * @param {Object} req : http request object
     * @param {Object} res : http response object
     */
    static uploadFoodCategory = async (req, res) => {
        //get categories
        let categories = req.body.categories
        if(!categories)
            return erroReport(res, 400, "allFields")
        if(!(Array.isArray(categories) && categories.length !== 0))
            return erroReport(res, 400, null, "wrong type, categories must be a list and length shouldnt be zero")
        
        
        //form category object
        let catDb = []
        for (const cat of categories) {
            let checkIfAlready = await FoodCatModel.find({where: {name:cat}})
            if(!checkIfAlready)
                catDb.push({name:cat})
        }
        try {
            //save category object
        await FoodCatModel.insertMany(catDb)
        return res.status(200).json({"message": "categories added"})
        } catch(err) {
            console.log(err)
            return erroReport(res, 501, "internalE")
        }
    }

    /**
     * upload Food Category
     * @param {Object} req : http request object
     * @param {Object} res : http response object
     */
    static ViewFoodCategory = async (req, res) => {
        //get categories
        let categories = await FoodCatModel.find()//null or list
        let output = []
        for (const cat of categories) 
            {
                output.push({id:cat._id, name:cat.name})
            }
        return res.status(200).json(output)
    }

    /**
     * upload food into the database
     * @param {object} req: http request object 
     * @param {object} res: http respone object
     */
    static uploadFood = async (req, res) => {
        try {
            let foodDetails = req.body //{category:categoryId,description:description name ,url, fileName, size, special, day]}
            let food = null
            //logic for already uploaded foods
            if(foodDetails.name && foodDetails.size)
                food = await FoodModel.findOne({name:foodDetails.name, size:foodDetails.size}, {_id:0}).lean().select("-_id, -__v")
            //if no found is already uploaded ensure all fields are given
            if(!food) {
                if(!(foodDetails.size && foodDetails.price && foodDetails.url && foodDetails.description)) 
                    return erroReport(res, 400, "allFields")
            }
            //ensure if food is special day is given
            if(foodDetails.special && !foodDetails.day)
                return erroReport(res, 400, false, "wrong format. if food is special but day is null")

            //check if the save food size and price is already saved
            if(food && (food.size === foodDetails.size) && (food.price === foodDetails.price))
                return erroReport(res, 400, false, "food with the save entry already saved")
            //form food model
            let foodDb = null
            //food is already uploaded, create a new food model by using the uploaded food details
            //and replace just replace the details that is given
            if(food)
                foodDb = new FoodModel({...food, ...foodDetails})
            else{
                foodDb = new FoodModel(foodDetails)
                //image handling
                //get extension from file 
                let ext = path.extname(foodDetails.fileName)
                //generate unique file name with food id
                let fileName = foodDb._id.toString() + ext
                console.log(fileName)
                let base64 = foodDetails.url.split("base64,")[1]
                let data = await saveUpolaodFileDisk(fileName, base64)
                //check if image is successfully saved
                if(data) {
                    let url =  generateFileUrl(data.ulrPath)
                    console.log(url)
                    //update food url
                    foodDb.ulrPath = url
                    console.log(url)
                } else {
                    return res.status(501).json({"message": "cant saved image"})
                }
            }
            await foodDb.save()

            return res.status(200).json({"message": "food saved"})
            } catch(errror) {
                console.log(errror)
                return erroReport(res, 501, "internalE")
            }
    }

    static checkEntry = async (req, res) => {
        try {
            let name = req.body.name //{category:categoryId,description:description name ,url:urlOfPic, name:nana,sizes:[{name:larg, price:300},{name:medium, price:200}]}
            let entry = await FoodModel.findOne({name})
            return res.status(200).json({found:entry?true:false})
            } catch(error) {
                console.log(error)
                return erroReport(res, 501, "internalE")
            }
    }

    /**
     * upload food into the database
     * @param {object} req: http request object 
     * @param {object} res: http respone object
     */
    static editFood = async (req, res) => {
        try {
            let foodDetails = req.body //{category:categoryId,description:description name ,url:urlOfPic, name:nana,sizes:[{name:larg, price:300},{name:medium, price:200}]}
            let acceptedKeys = ["sizes","price","special", "day", "name", "url", "description", "category"]
            //check if all food fields are given
            if(!foodDetails.id)
                return erroReport(res, 400, false, "id for food is required")
            let food = await FoodModel.findById(foodDetails.id)
            //check for entry and update according
            for(const key of Object.keys(foodDetails)) {
                if(!acceptedKeys.includes(key))
                    return erroReport(res, 400, false, `the key ${key} is not accepted as a valid column`)
                food[key] = foodDetails[key]
            }
            await food.save()
            return res.status(200).json({"message": "success"})
            } catch(errror) {
                console.log(errror)
                return erroReport(res, 501, "internalE")
            }
    }


     /**
     * delete food from the database
     * @param {object} req: http request object 
     * @param {object} res: http respone object
     */
     static deleteFood = async (req, res) => {
        try {
            let foodId = req.params.id
            let food = await FoodModel.findByIdAndDelete(foodId)
            return res.status(200).json({message: "food successfuly deleted"})
            }
            catch(errror) {
                console.log(errror)
                return erroReport(res, 501, "internalE")
            }
    }

    /**
     * view foods 
     * @param {object} req: http request object 
     * @param {object} res: http respone object
     */
    static viewFoods = async (req, res) => {
        try {
            //get all object
            let response = await FoodModel.find().select("-__v, _id").lean()

            return res.status(200).json(response)
    }
    catch(error) {
        console.log(error)
        return erroReport(res, 501, false, "internalE")
        }
    }
/**
 * Get customers
 */

    static customers = async(req, res) => {
        let users = await UserModel.find({role:{$ne:"admin"}}).select("-__v").lean()
        return res.status(200).json(users)
    }


/**
 * enable food for the week or day
 * @param {Object} req 
 * @param {Object} res 
 */
    static enableFood = async (req, res) => {
        //get enable status
        let details  = req.body
        try {
            //check if all food details are given
        if(details.id && details.status )
            return erroReport(res, 400, 'allFields')
        //find food db entry
        let food = await FoodModel.findById(details.id)
        if (!food)
            return res.status(400).json({message: "food entry not found"})
        //else update food status
        food.enabled = details.status === "disable" ? false : true
        await food.save()
        return res.status(200).json({"message": "food status updated"})
    } catch(error) {
        console.log(error)
        return erroReport(res, 501, "internalE")
    }
  }

  
  static ViewOrders = async (req, res) => {
    //returns all orders that falls in a week
    let startOfWeek = new Date(moment().clone().startOf("week").toISOString() )//get start of week
    let endOfWeek =  new Date(moment().clone().endOf("week").toISOString())
    //check if created date is greater or equal to start of week date but lesser or equals end of week date
    const orders = await OrderModel.find({$and:[{createdAt:{$lte:endOfWeek}}, {createdAt: {$gte:startOfWeek}}]}).lean().select("-__v")
    //orders
    let returnOrder = []
    //get user name
    for (const order of orders) {
        let customer = await UserModel.findById(order.customerId).select("name").lean()
        returnOrder.push({...order, name:customer.name})
    }
    return res.status(200).json(returnOrder)
  }


}
export { AdminController }
