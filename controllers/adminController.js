import { FoodModel } from "../models/food.js"
import { FoodCatModel } from "../models/foodCategories.js"
import { addDays } from "../utils/datesHandler.js"
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
            let foodDetails = req.body //{category:categoryId,description:description name ,url:urlOfPic, name:nana,sizes:[{name:larg, price:300},{name:medium, price:200}]}
            let food = null
            //logic for already uploaded foods
            if(foodDetails.name && foodDetails.size)
                food = await FoodModel.findOne({name:foodDetails.name, size:foodDetails.size}, {_id:0}).lean().select("-_id, -__v")
            //if no found is already uploaded ensure all fields are given
            if(!food)
                if(!(foodDetails.size && foodDetails.price && foodDetails.url && foodDetails.description)) 
                    return erroReport(res, 400, "allFields")
            //ensure if food is special day is given
            if(foodDetails.special && !foodDetails.day)
                return erroReport(res, 400, false, "wrong format. if food is special but day is null")


            //check if the save food size and price is already saved
            if((food.size === foodDetails.size) && (food.price === foodDetails.price))
                return erroReport(res, 400, false, "food with the save entry already saved")
            //form food model
            let foodDb = null
            //food is already uploaded, create a new food model by using the uploaded food details
            //and replace just replace the details that is given
            if(food)
                foodDb = new FoodModel({...food, ...foodDetails})
            else
                foodDb = new FoodModel(foodDetails)
            //save the food
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
 * enable food for the week or day
 * @param {Object} req 
 * @param {Object} res 
 */
    static enableFood = async (req, res) => {
        let foods = req.body // [{id, duration:a | w}]
        let notFoundFood = []
        try {
        for(const food of foods) {
            if(!food.id)
                return erroReport(res, 401, false, "wrong format food should contain id")
            let foodDb = await FoodModel.findById(food.id)
            if(!foodDb)
                notFoundFood.push(food)
            else {
                let addedDate = null
                if(food.duration !== "a")
                    addedDate = addDays(7)
                else
                    addedDate = addDays(1)
                foodDb.allowedEndDate = addedDate
                await foodDb.save()
            }
        }
        let message = "success"
        let status = 200
        if(notFoundFood.length !== 0) {
            message = `couldnt find these foods ${allowedEndDate}`
            status = 400
        }
        res.status(status).json({message})
    } catch(error) {
        console.log(error)
        return erroReport(res, 501, "internalE")
    }
}

}
export { AdminController }
