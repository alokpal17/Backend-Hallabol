import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, _, next ) => {
    try {
        const token = req.cookies?.accessToken || req.header ("Authorization")?.replace("Bearer ", "")
    
        if(!token) {
            throw new ApiError(4001, "Unauthorized request")
        }
    
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
       await User.findById(decodedToken?.id).select("-password -refreshToken")
    
       if (!User) {
        throw new ApiError(404, "Invalid Access Token")
       }
    
       req.user = User;
       next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }

})