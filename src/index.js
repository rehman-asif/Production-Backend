import dotenv from "dotenv"

import connectDB from "./db/database_connection.js";

dotenv.config(
    {
        path:"./env"
    }
)

connectDB()