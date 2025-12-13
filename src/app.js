import express from 'express';
import cookieParser from 'cookieparser';
import cors from 'cors';

const app = express();

//Parse = convert raw data into something JavaScript can understand and use.
app.use(cors(
    {
        origin: process.env.CORS 
    }
)); // cors is used to allow cross-origin requests that makes frontend and backend to communicate

app.use(express.json({
    limit: '20kb'
})); // express.json() is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser.
/*Reads JSON data from request body and converts it into a JS object.
Before parsing: "{ \"name\": \"Kuldeep\" }"
After parsing: { name: "Kuldeep" } */

app.use(cookieParser()); // cookie-parser is a middleware which parses cookies attached to the client request object.

app.use(express.urlencoded({ 
    extended: true, limit: '20kb' 
})); // express.urlencoded() is a built-in middleware function in Express. It parses incoming requests with URL-encoded payloads and is based on body-parser. 
/*Reads form data (HTML forms) and converts it into JS object.
Form sends: username=abc&password=123
After parsing: { username: "abc", password: "123" } */

app.use(express.static('public')); // Serve static files from the 'public' directory
export default app;