import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userScehma=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true   // index true is liye kia ta k hum isko DB mein easily search kr skein or for optimization
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,   // cloudinary URL
        required:true,
    },
    coverImage:{
        type:String  // cloudinary
    },
    watchHistory:[
       {
        type:Schema.Types.ObjectId,
        ref:"Video"
       }    
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

// password hashing configuration before saving into DB

userScehma.pre("save",async function(next){
    if(this.isModified('password')){
    this.password=bcrypt.hash(this.password)
    next()
}

 // password checking by comparing the hash password with original password

userScehma.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}})

userScehma.methods.generateAccessToken=function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userScehma.methods.generateRefreshToken=function(){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userScehma)