import dotenv from 'dotenv'                  
dotenv.config({ path: '.env' })               // Loads all variables from .env into process.env


import database from "./db/index.js";



database()







/* We can write the code here too but it will make everything hard to read so we create a file in db folder and import it here


const app = express();                        // Initialize the Express application (your server)


// IIFE = Immediately Invoked Function Expression
// We use this so we can run async code (like DB connection) at the top level.
;(async()=>{

    try {                                     // Try block protects the startup sequence. This is where you attempt something that might fail.

        // "await" ensures the server waits until MongoDB is connected.
        // Without await = server may start even if DB fails → broken app.
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log("Connected to the database successfully");

        // Express can emit an "error" event if internal server issues occur/express sever issue.
        // If that happens, this listener catches it.
        app.on("error",(error)=>{
            console.error("Error in the server",error);

            //throw ends the function immediately (STOP EVERYTHING.THIS IS BROKEN.CRASH NOW.)
            // Throwing here makes the app crash immediately.
            // Better to crash than run half-broken.
            throw error
        })
         
        // Starts the server on the port defined in .env (PORT=3000 etc.)
        // Using process.env.PORT is important because cloud providers FORCE their own ports.
        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })

    } catch (error) {                          // This catch handles errors from DB connection or server startup

        console.error("Error connecting to the database", error);

        // Throwing again ensures:
        // - App does NOT continue in a broken state
        // - Error becomes visible in logs
        throw error
    }

})()// This final () immediately runs the async function.

*/