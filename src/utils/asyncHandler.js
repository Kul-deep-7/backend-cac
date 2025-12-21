
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
        //Promise.resolve(): Converts anything into a Promise
    }
}


export { asyncHandler }


/*
What problem this code is solving (first understand WHY)

In Express:
Sync errors are caught automatically
Async errors are NOT
Example (problem code):

app.get("/user", async (req, res) => {
  const user = await User.findById(id) // ❌ error here
  res.json(user)
})

If User.findById fails:
Express does NOT catch it
Server may crash or hang
Error middleware is skipped
This is bad backend design.
So we need a wrapper that:
catches async errors
sends them to Express error middleware
That wrapper is asyncHandler.


Full execution flow 

When a request comes in:
Express calls the wrapper function
Wrapper calls requestHandler(req, res, next)
If everything is OK:
response is sent
Promise resolves
If error occurs:
Promise rejects
.catch() runs
next(err) forwards error
next() → move to next middleware
next(err) → jump to error-handling middleware
Error middleware sends response

*/


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
