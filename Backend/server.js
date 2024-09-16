import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config(
    {
        path: "./env",
    }
);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is running on PORT : ${process.env.PORT}`);
    });
    app.on("error", (err)=>{
        console.log(`Got an error while connecting to server: ${err}`);
    })
})
.catch(err=>{
    console.log("MongoDB Connection Failed: ", err);
})