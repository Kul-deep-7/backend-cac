class ApiError extends Error { //ApiError is your custom error. Error is JavaScript’s built-in error class
    //You are not reinventing error handling. You are building on top of JS Error instead of throwing random strings.
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
        //constructor is a special method for creating and initializing an object created within a class.
        //runs automatically when we "throw new ApiError()"
        //A constructor runs when you create a new object. EG:new ApiError(404, "User not found")

    ){
        super(message) //super() invokes(calls) the parent class constructor.
        //this refers to ONE object that contains properties from BOTH parent AND child, but there's a hierarchy:1. Parent Properties Come FIRST (via super()). 2. Then You Add YOUR Properties

        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}


/*
// Step-by-step what happens:
1. You call: new ApiError(404, "Not found")

2. JavaScript creates empty object: {}

3. Constructor runs:
   - super("Not found") → Calls Error constructor
     • Error sets: {message: "Not found", name: "Error"}

4. NOW YOUR CODE RUNS:
   this.statusCode = 404
   // Adds NEW property: statusCode to the object
   
   this.success = false
   // Adds NEW property: success to the object
   
   // etc...

5. Final object has BOTH:
   - Parent's properties (message, name, stack)
   - Your properties (statusCode, success, data, errors)
---------------------------------------------------------------

const error = new ApiError(404, "Not Found");

// `this` becomes:
{
  // From Parent (Error class):
  message: "Not Found",    // Set by super(message)
  name: "Error",           // Set by Error constructor
  stack: "Error trace...", // Set by Error.captureStackTrace
  
  // From Child (Your ApiError class):
  statusCode: 404,         // Set by this.statusCode
  success: false,          // Set by this.success = false
  data: null,              // Set by this.data = null
  errors: []               // Set by this.errors = errors
}

__________________________________________________________________________________

EXPLANATION OF ApiResponse CLASS (BEGINNER NOTES)
================================================

Code Reference:
---------------
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }

------------------------------------------------

1. What is ApiResponse (Big Picture)
-----------------------------------
ApiResponse is a class used to send responses from backend to frontend
in a fixed, consistent format.

Instead of sending random JSON structures, ApiResponse ensures
every response looks the same.

Typical API response structure:
{
  statusCode: 200,
  data: {...},
  message: "Success",
  success: true
}

This improves:
- consistency
- readability
- frontend handling
- debugging

------------------------------------------------

2. class ApiResponse
-------------------
The keyword `class` is used to create a blueprint.

ApiResponse is a blueprint that defines:
- what data an API response should contain
- how success/failure is determined

Real-life analogy:
- Class = empty form
- Object = filled form

------------------------------------------------

3. constructor
--------------
The constructor is a special function inside a class.

It runs automatically when:
new ApiResponse(...) is called.

Purpose of constructor:
- initialize object properties
- assign values to the response object

Constructor parameters:
- statusCode → HTTP status code (200, 201, 400, 404, 500)
- data → actual response data
- message → human-readable message (default = "Success")

Default value:
If message is not provided, "Success" is used automatically.

------------------------------------------------

4. this keyword
--------------
`this` refers to the current object being created.

Every `this.property` attaches a value to that object.

Example:
this.statusCode = statusCode

Means:
responseObject.statusCode = statusCode

------------------------------------------------

5. this.statusCode
------------------
Stores the HTTP status code of the response.

Examples:
- 200 → OK
- 201 → Created
- 400 → Bad Request
- 404 → Not Found
- 500 → Server Error

Used by frontend and browsers to understand result type.

------------------------------------------------

6. this.data
------------
Stores the actual response data.

Data can be:
- object
- array
- string
- null

Examples:
data = userObject
data = usersArray
data = null

------------------------------------------------

7. this.message
---------------
Stores a readable message explaining the response.

Examples:
- "Success"
- "User fetched successfully"
- "Post created"

Helps frontend show messages to users.

------------------------------------------------

8. this.success (Important Logic)
--------------------------------
this.success = statusCode < 400

This line automatically decides success or failure.

HTTP rules:
- 2xx → success
- 3xx → redirection (still not error)
- 4xx → client error
- 5xx → server error

Logic:
statusCode < 400 → success = true
statusCode >= 400 → success = false

Examples:
200 < 400 → true
404 < 400 → false
500 < 400 → false

Frontend does NOT calculate success.
Backend decides it here.

------------------------------------------------

9. Object Creation Example
--------------------------
const response = new ApiResponse(
  200,
  { name: "Kuldeep" },
  "User fetched"
)

Creates this object:
{
  statusCode: 200,
  data: { name: "Kuldeep" },
  message: "User fetched",
  success: true
}

------------------------------------------------

10. Using ApiResponse in Express
-------------------------------
res.status(200).json(
  new ApiResponse(200, user, "User fetched successfully")
)

Every API response now has:
- statusCode
- data
- message
- success

------------------------------------------------

11. Why ApiResponse is Needed
-----------------------------
Without ApiResponse:
res.json(user)
res.json({ user })
res.json({ success: true, data: user })

This leads to:
- inconsistent responses
- messy frontend logic
- harder debugging

With ApiResponse:
- single response format
- predictable structure
- clean frontend handling

------------------------------------------------

12. Relation with ApiError
--------------------------
ApiResponse → used for successful responses
ApiError    → used for error responses

Both together ensure:
- uniform API design
- professional backend structure

------------------------------------------------

13. Exam-Ready Definitions
--------------------------
Class        → Blueprint for creating objects
Constructor  → Initializes object values
this         → Refers to current object
ApiResponse  → Standard API response wrapper
success      → Boolean derived from status code

------------------------------------------------

14. Mental Model (Very Important)
--------------------------------
Backend is saying:

"Here is the result
Here is the data
Here is the message
Did it succeed or fail?"

ApiResponse simply packages this information.

------------------------------------------------

FINAL NOTE
----------
ApiResponse looks simple but solves a big problem.
Without it, APIs become inconsistent and hard to maintain.

================================================
END OF NOTES
================================================
______________________________________________________________________________________________________________________

ASYNC HANDLER – COMPLETE BEGINNER NOTES
======================================

Code Reference:
---------------
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
          .resolve(requestHandler(req, res, next))
          .catch((err) => next(err))
    }
}

export { asyncHandler }

------------------------------------------------------------

1. What problem asyncHandler solves
----------------------------------
In Express, async route handlers can throw errors.

Example problem:
---------------
app.get("/user", async (req, res) => {
  const user = await User.findById(id)   // error here
  res.json(user)
})

If an error occurs:
❌ Express does NOT catch it automatically
❌ Server crashes or request hangs

asyncHandler exists to:
- catch async errors
- forward them to error middleware
- avoid writing try-catch everywhere

------------------------------------------------------------

2. What asyncHandler is (big picture)
------------------------------------
asyncHandler is a:
- Higher Order Function
- Error wrapper for async routes

Definition:
A function that takes another function and returns a new function
with added error-handling behavior.

------------------------------------------------------------

3. asyncHandler is a Higher-Order Function
-----------------------------------------
const asyncHandler = (requestHandler) => { ... }

Meaning:
- requestHandler = your route function
- asyncHandler wraps it safely

Example input:
--------------
async (req, res, next) => {
  const user = await User.find()
  res.json(user)
}

Example output:
---------------
A new function that safely handles errors

------------------------------------------------------------

4. Returned function (Express middleware)
----------------------------------------
return (req, res, next) => { ... }

This returned function is:
- a valid Express middleware
- receives req, res, next automatically

Express calls THIS function, not your original one.

------------------------------------------------------------

5. Promise.resolve(...)
-----------------------
Promise.resolve(requestHandler(req, res, next))

What this does:
- Converts requestHandler into a Promise
- Works for both async and non-async functions

If requestHandler:
- returns data → resolved
- throws error → rejected

------------------------------------------------------------

6. .catch((err) => next(err))
-----------------------------
If Promise rejects:
- error is caught
- passed to next(err)

Why next(err)?
--------------
Express rule:
If next() receives an argument → it is treated as an error
→ jumps directly to error-handling middleware

------------------------------------------------------------

7. Flow of execution (VERY IMPORTANT)
-------------------------------------
When a request comes:

1. Express calls the wrapped function
2. requestHandler executes
3. If success → response sent
4. If error → Promise rejects
5. catch() runs
6. next(err) forwards error
7. Error middleware handles response

------------------------------------------------------------

8. How asyncHandler is USED
---------------------------
Instead of writing this:

app.get("/user", async (req, res, next) => {
  try {
    const user = await User.find()
    res.json(user)
  } catch (err) {
    next(err)
  }
})

You write this:

app.get(
  "/user",
  asyncHandler(async (req, res, next) => {
    const user = await User.find()
    res.json(user)
  })
)

Cleaner. Safer. Scalable.

------------------------------------------------------------

9. Why Promise.resolve is used instead of async/await
-----------------------------------------------------
Promise.resolve():
- handles both sync + async functions
- avoids unnecessary async keyword
- shorter and cleaner

This is a PROFESSIONAL pattern.

------------------------------------------------------------

10. Understanding the commented versions
----------------------------------------

A) const asyncHandler = () => {}
--------------------------------
An empty function.
Does nothing.
Useless.

------------------------------------------------------------

B) const asyncHandler = (func) => () => {}
------------------------------------------------
- Takes a function
- Returns a function
- But returned function does nothing

Still useless.

------------------------------------------------------------

C) const asyncHandler = (func) => async () => {}
------------------------------------------------
- Async wrapper
- Still does nothing
- No error handling logic

Incomplete idea.

------------------------------------------------------------

D) Try-Catch Version (Alternative)
----------------------------------
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message
    })
  }
}

Problems:
---------
❌ Response logic mixed with middleware
❌ Not reusable with ApiError
❌ Breaks centralized error handling
❌ Harder to scale

------------------------------------------------------------

11. Why next(err) version is BETTER
----------------------------------
- Centralized error handling
- Works with ApiError
- Clean separation of concerns
- Industry standard

------------------------------------------------------------

12. Relation with ApiError and Error Middleware
----------------------------------------------
Flow:
asyncHandler → next(err) → error middleware → ApiError response

Example error middleware:
-------------------------
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  })
})

------------------------------------------------------------

13. Mental Model (REMEMBER THIS)
--------------------------------
asyncHandler is a safety net.

It says:
"Run the async function.
If it fails, I’ll handle it.
Don’t crash the server."

------------------------------------------------------------

14. Exam-Ready Definitions
--------------------------
asyncHandler:
A higher-order function that wraps async route handlers
to catch errors and forward them to Express error middleware.

Higher-Order Function:
A function that takes another function as argument
or returns a function.

next(err):
Passes error to Express error-handling middleware.

------------------------------------------------------------

FINAL VERDICT
-------------
If you don’t use asyncHandler:
- code becomes repetitive
- errors are inconsistent
- backend becomes fragile

This pattern is NOT optional.
This is how real Express apps are written.

====================================
END OF NOTES
====================================

*/
