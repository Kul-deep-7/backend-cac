import dotenv from "dotenv";
dotenv.config();
/* 
Node.js Lesson: Environment Variables & Import Order (ES Modules)
Problem

Cloudinary process.env values were undefined even though .env existed.

Reason

In Node.js ES Modules, all import statements are resolved before any code runs.
So files like cloudinary.js were imported before dotenv.config() executed.

Key Rule

Any file that uses process.env must be imported after dotenv has been loaded.

Why normal dotenv.config() failed

Even though dotenv.config() was written at the top of index.js, Node first loaded all imported files (app.js → routes → controllers → cloudinary.js) and then executed dotenv.config().

Too late.

Solution (Best Practice)

Create a dedicated environment preload file.

// env.js
import dotenv from "dotenv";
dotenv.config();


Import it first in the entry file:

// index.js
import "./env.js";
import app from "./app.js";

Result

Environment variables load first

All imported files can safely access process.env

Cloudinary upload works correctly

One-line takeaway

In Node.js ES Modules, environment variables must be loaded before importing files that use them.
*/