import dotenv from 'dotenv'                  
dotenv.config({ path: '.env' })               // Loads all variables from .env into process.env
import mongoose from "mongoose";              // Mongoose helps connect to MongoDB and manage schemas
import express from "express";                // Express helps create the server and handle routes
import { DB_NAME } from '../constants.js';     // DB_NAME is kept separate for cleaner and flexible config


async function database() {
    try {
        const connection=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       // console.log("Mongo DB connection done from #2 way", connection) connection → the object returned by mongoose.connect().
       console.log("Mongo DB connection done from #2 way")
    } catch (error) {
        console.log("Error in mongoDB connection", error)
        process.exit(1) //this kills your Node.js process because your app can’t function without the DB.1 is a convention: 0 = success
    }
}

export default database

//this is the other way to connect 