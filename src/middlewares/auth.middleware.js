import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"

export const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        //This line extracts JWT either from cookies or from the Authorization header to support multiple client types safely.
        const token = req.cookies?.accessToken //got access from cookieparser & accessToken from cookies.. remember we added it to cookies in login controller res. (?)optional chaining- If req.cookies is undefined → don’t crash, just return undefined
        || req.header("Authorization")?.replace("Bearer ", "") //Get the access token from cookies.If it’s not there, get it from the Authorization header
        /* 
        The Authorization header is a standard HTTP request header used to send authentication credentials from the client to the server. It tells the server who the client is and proves that identity.
    
    Where it lives: An HTTP request looks like this:
    GET /api/users/profile HTTP/1.1
    Host: example.com
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Content-Type: application/json
    
    Why it exists- HTTP is stateless: Server does not remember users automatically. Every request must prove identity again
    So for protected routes, the client sends proof each time using: Cookies OR Authorization header 
    
        format: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        replace method is used why? we dont need the word bearer just the token so we remove "Bearer " so it only returns the token not with word "Bearer "
        */
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        } //if not token exists client is not logegd in
    
        //Token verification-It checks whether the token is real and unmodified, and if yes, extracts the data stored inside it.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)//when we signed the access token key in user.models using (jwt.sign()... we had the secret in it.. wwe should add the same secret key here to verify)
    /* 
    jwt.verify() validates the authenticity and expiry of a JWT using the secret key and returns the decoded payload if the token is valid.
    jwt.sign() = create identity proof
    jwt.verify() = check identity proof
    */
    
        const user = await User
            .findById(decodedToken?._id) // Finds the user document using the _id extracted from the decoded JWT.
            // This _id was added to the token payload when the token was created using jwt.sign() in the user model.
            .select("-password, -refreshToken")
    
            if(!user){
                throw new ApiError(401, "Invalid Access Token")
            }
    
            req.user = user //req object with .user(we can name it .cooldeep too) has the user from above
            next()
    } catch (error) {
        throw new ApiError(401, "invalid Access Token")
    }
})