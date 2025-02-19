import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens=async(userId)=>{
    try {
       const user= await User.findById(userId)
       const accessToken=user.generateAccessToken()
       const refreshToken=user.generateRefreshToken()
        // adding refresh token in the DB object 
       user.refreshToken=refreshToken
        // and then save the refresh token into DB
      await user.save({validateBeforeSave:false})
      return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Some thing went wrong when generating access and refresh token")      
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    console.log("Email:", email);

    // Validation: Check for empty fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required.");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    console.log("Avatar Path:", avatarLocalPath);
    console.log("Cover Image Path:", coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required.");
    }

    // Upload avatar to Cloudinary
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar || !avatar.url) {
            throw new ApiError(400, "Avatar upload failed.");
        }
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message || error);
        throw new ApiError(500, "Avatar upload failed.");
    }

    // Upload cover image if provided
    let coverImage = null;
    if (coverImageLocalPath) {
        try {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        } catch (error) {
            console.error("Error uploading cover image:", error.message || error);
        }
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully.")
    );
});

const loginUser=asyncHandler(async (req,res)=>{
    // req body ->data
    // username or email
    // find the user
    // password check
    // access and refreshToken
    // send cookies

    // 1- data from req body
    const {email,username,password}=req.body

    if(!(username || password)){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{ username },{ email }]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    
    // isPasswordCorrect method is used form user.model.js file

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){   
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,  // cookies is only modified from the server not from frontend side
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        console.error("Logout Error: req.user is undefined");
        throw new ApiError(401, "Unauthorized request");
    }

    // Clear the refresh token in the database
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        { new: true }
    );

    console.log("Updated User: ", user); // Debug updated user

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Clear the cookies
    res
        .clearCookie("accessToken", {
            httpOnly: true,
            secure: true, // Set this to false for local testing if not using HTTPS
            sameSite: "strict",
        })
        .clearCookie("refreshToken", {
            httpOnly: true,
            secure: true, // Set this to false for local testing if not using HTTPS
            sameSite: "strict",
        })
        .status(200)
        .json({
            success: true,
            message: "User logged out successfully",
        });
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
   }

   const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
   )

   const user = await User.findById(decodedToken?._id)

   if(!user){
    throw new ApiError(401,"Invalid refresh token")
   }

   if(incomingRefreshToken  !== user?.refreshToken){
    throw new ApiError(401,"Refresh token is expired or used")
   }

   const options={
    httpOnly:true,
    secure:true
   }
   const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)

   return res
   .status(200)
   .cookie("Access Token",accessToken)
   .refreshToken("Refresh Token",newrefreshToken)
   .json(
    new ApiResponse(
        200,
        {accessToken,newrefreshToken},
        "Access Token refreshed"
    )
   )
})

export {
    registerUser,
    loginUser,
    logoutUser
    }
