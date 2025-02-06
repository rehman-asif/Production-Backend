import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

// jab bhi koi request aye to wo sirf hamara frontend hi us k liye authorize ho

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true    
}))


// form wagera se ya koi json format mein data arha hai to uski configuration 

app.use(express.json({
    limit:"16kb"
}))

// use to get data from URL
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

// use to store files or images etc in the public folder
app.use(express.static("public"))

// is ka use hum is liye krty hain ta k mein apny server pr beth k apny user ya browser ki cookies set bhi kr pau or unko change bhi kr pay ya crud operation perfrom kr sky

app.use(cookieParser())


// routes import

import userRouter from "./routes/user.routes.js"


// routes declaration

app.use("/users",userRouter)

export {app}