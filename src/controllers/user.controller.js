import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    // steps to register the user in Db

    // get user details from frontend
    // validation - not empty
    // check if user is already exists : username or email
    // check for images and check for avatar
    // upload them to cloudinary , avatar
    // create user object - create entry in DB
    // remove password and refresh token field from the response
    // remove password and refresh token field from response
    // check for user creation
    // return response


    // 1- getting data from the frontend side
    const {username,email,fullName,password}=req.body
    console.log("email :",email);

    // 2- validation checking
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required is required")
    }
    const existedUser= User.findOne({
        $or:[{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409,'User with email or username already exists')
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar is required field")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }
    // in this case i write the res.status 201 because when we test API on postman then i have to give some status code that it have to show 
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

});

export {registerUser}
