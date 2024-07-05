import { erroReport } from "../utils/errors.js"
import { FoodSizesModel } from "../models/foodSizes.js"
import { FoodCatModel } from "../models/foodCategories.js"
import { FoodModel } from "../models/food.js"
import { Types} from "mongoose"

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
            let foodDetails = req.body //{category:categoryId,description:description name ,url:urlOfPic, name:nana,sizes:[{name:larg, price:300},{name:medium, price:200}]}
            //check if all food fields are given
            if(!(foodDetails.url && foodDetails.name && foodDetails.sizes && foodDetails.description && foodDetails.category)) 
                return erroReport(res, 400, "allFields")
            //check if food with the same name exists
            let food = await FoodModel.findOne({name:foodDetails.name})
            if(food)
                return erroReport(res, 400, false, "food with the same name alredy exist")
            //check if id is correct
            let catDb = await FoodCatModel.findById(foodDetails.category)
            if(!catDb)
                return erroReport(res, 400, "catNotFound")
            let foodDb = new FoodModel({url:foodDetails.url,name:foodDetails.name, categoryId:catDb._id, description:foodDetails.description})              
            //save food sizes
            let foodSizes = []
            for(const size of foodDetails.sizes){
                if(!(size.name && size.price && size.price >= 0))
                    return erroReport(res, 400, false, "wrong size format, size should be object containing name and price, price shouldnt be less than zero")
                foodSizes.push({foodId: foodDb._id, ...size})
            }
            //save food and price
            let response = await Promise.all([foodDb.save(), FoodSizesModel.insertMany(foodSizes)])
            return res.status(200).json({"message": "success"})
            } catch(errror) {
                console.log(errror)
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
            let acceptedKeys = ["sizes", "name", "id", "url", "description", "category"]
            //check if all food fields are given
            if(!foodDetails.id)
                return erroReport(res, 400, false, "id for food is required")
            let food = await FoodModel.findById(foodDetails.id)
            //check for entry and update according
            for(const key of Object.keys(foodDetails)) {
                if(!acceptedKeys.includes(key))
                    return erroReport(res, 400, false, `the key ${key} is not accepted as a valid key`)
                if(key === "sizes")
                    {
                        for(const updatedSize of foodDetails[key])
                            {
                                if(!(updatedSize.name && updatedSize.price))
                                    return erroReport(res, 401, false, "wrong size format, size should be object containing name and price, price shouldnt be less than zero")
                                let foodSize = await FoodSizesModel.findOne({name:updatedSize.name, foodId:food._id})
                                if(foodSize)
                                    {   
                                        foodSize.price = updatedSize.price
                                        await foodSize.save()
                                    } else {
                                        await new FoodSizesModel({foodId:food._id, name:updatedSize.name, price:updatedSize.price}).save()

                                    }
                            }
                    }
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
            if(!food)
                return erroReport(res, 400, false, "cant find food entry with id")
            //delete all food sizes
            await FoodSizesModel.deleteMany({foodId:food._id})
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
            let output = []
            let response = await FoodModel.find().select("-_v")
            for(let food of response) {
                //get food model
                let sizes = (await FoodSizesModel.find({foodId:food._id}).select("name price -_id")).map((size) => {
                    return {name:size.name, price:parseFloat(size.price.toString())}
                })
                let category = await FoodCatModel.findById(food.categoryId).select("name -_id")
                //sanitize the results
                output.push({sizes, category:category.name, id:food._id,description:food.description, url:food.url, name:food.name})
            }
            return res.status(200).json(output)
    }
    catch(error) {
        console.log(error)
        return erroReport(res, 501, false, "internalE")
        }
    }

}
export {AdminController}