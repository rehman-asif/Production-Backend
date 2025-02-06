import dotenv from "dotenv"
import connectDB from "./db/database_connection.js";
import { app } from "./app.js";

dotenv.config({
    path:"./env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 6000, () => {
        console.log(`Server is running at port ${process.env.PORT || 6000}`);
    });

    // Error listener for uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.log("ERROR:", err);
        process.exit(1);  // Exit the process after logging the error
    });
})
.catch((err) => {
    console.log(`MongoDB connection failed!!!`, err);
});
