/*handle token generation and decoding */
import configuration from "config"
import Jwt  from "jsonwebtoken";

const generateToken = (userDetails) => {
/**
 * generateToken: generates token from user details and secrete key
 * @param{object}userDetails: user details to generate token form
 * return token or null
 */
const token = Jwt.sign(userDetails,  
    configuration.token.secreteKey, { 
        expiresIn: 86400 * 10
    }); 
    return token
}

const decodeToken = (userToken) => {
    /**
     * decodeToken : convert json web token into user details
     * @param{string} userToken: token object for user
     * return user details or null
     */
    try{
        let userDetails = Jwt.verify(userToken, configuration.token.secreteKey)
        return userDetails
    }catch(err) {
        return null
        }

    }


const getAuthorizationtoken = (request) => {
        /**
         * getAuthorizationtoken: get authorization token from request header
         * @param {object} request: http request header
         * @returns {string} : token 
         */
        let token = null
        if(request.header("Authorization"))
            token = request.header("Authorization").trim()
        if(!token) {
            return null
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice("7")
            token = token.trim()
        }
        return token
    }


export {generateToken, decodeToken, getAuthorizationtoken}