import { UserAddressModel } from "../models/address.js"

class ClientController {
    /**
     * adds user address
     * @param {object} req 
     * @param {object} res 
     * @returns json object
     */
    static addAddress = async (req, res) => {
        //
        let addressinfo = req.body
        if(!(addressinfo.addressLine1 && addressinfo.city && addressinfo.town && addressinfo.addAddress))
            return erroReport(res, 401, "allFields")
        //save information to the database
        let response = await new UserAddressModel(addressinfo).save()
        return res.status(200).json("address added")
    }
}

export {ClientController}