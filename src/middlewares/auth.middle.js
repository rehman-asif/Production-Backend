import { User } from "../models/user.model.js"; 
import { ApiError } from "../utils/ApiError.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // Extract token from cookies or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        console.error("No token found in cookies or Authorization header"); // More detailed error log
        throw new ApiError(401, "Unauthorized request: Token not found");
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user in the database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
            console.error("User not found in the database"); // Debugging line
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;  // Assign user to request object
        console.log("User found:", req.user);  // Debugging line
        next();  // Proceed to next middleware or route handler
    } catch (error) {
        console.error("JWT Verification Error:", error.message);  // Debugging line
        throw new ApiError(401, error.message || "Invalid access token");
    }
});
