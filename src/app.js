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

// humne useRouter apni mrzi ka name diya hai or wo hum sirf tab hi de skty hain jub humne export default kiya ho

import  useRouter  from "./routes/user.routes.js"


// routes declaration

// wo donot use app.get because wo declare the routes in separate files and pehly we declare the route in the same file that's why we use middle ware named as app.use

app.use("/api/v1/users",useRouter)

export {app}