import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"


const veriFyJWT = asyncHandler( async(req, _, next) => {//if res es empty we can write _
    // verify tokken here
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) {
            throw new ApiError(401, "Unauthorized request.");
        }

        //console.log(token);
    
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       const user = await User.findById(decodedToken?._id).select("-password -refreshTokens");
       if(!user) {
        //discues in frontend 
        throw new ApiError(401, "Invalid Access Token");
       }
    
       req.user = user;
       next();
    } 
    catch(error) {
        throw new ApiError(401, error.message || "Invalid access token")   
    }
    
})

export { veriFyJWT };