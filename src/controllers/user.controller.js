import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//helper function which needs userId& is async cuz DB word + token creation takes time
const generateAccessAndRefreshTokens = async(userId)=> {
    try {
        const user = await User.findById(userId) //fetch user from db using userId. User is mongoose model & findById is mongoose method.
        const accessToken =user.generateAccessToken() //generates access token using instance method(as we discussed in loginUser function)
        const refreshToken = user.generateRefreshToken()

        //store refresh token inside user's document.. helps with logout,security, etc
        user.refreshToken = refreshToken //meaning in the db we are storing the refresh token
        await user.save({validateBeforeSave : false}) //save the updated user document with the new refresh token
        //mongoose re-checks all validations before saving, even if only one field is changed, so we skip validation when it’s not needed.
        //This speeds up the save operation and avoids unnecessary validation errors.
        //e.g. if we only update refreshToken, we don’t need to re-validate email, password, etc.
        //If password rules change later form(6 char to 8 char), old users may fail validation cuz .save() will run & check validation again during login even though they didn’t change their password, so we skip validation when saving refresh tokens.
        
       //console.log("NEW ACCESS TOKEN ", accessToken) //for testing purpose
        //console.log("NEW REFRESH TOKEN ", refreshToken)

        return {accessToken, refreshToken} //return both tokens to the caller
        
    } catch (error) {
        throw new ApiError(500, "Could not generate tokens")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    //algorithm: 
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response to frontend

    const{fullName,email,password,username}=req.body
    //console.log("email:",email)


    /*if(!fullName || fullName.trim()===""){
        throw new ApiError(400,"Name is required")
    }else if(!email || email.trim()===""){
        throw new ApiError(400,"Email is required")
    }else if(!password || password.trim()===""){
        throw new ApiError(400,"Password is required")
    }else if(!username || username.trim()===""){
        throw new ApiError(400,"Username is required")
    }
    })
    */

     if (
        [fullName, email, username, password].some( //The .some() method returns true if at least one element in an array satisfies a condition.
            (field) => {
                //console.log("Checking field:", field) -> for debugging and checking using postman
                return field?.trim() === ""}//cb function.. field means 1 value at a time.
         )//field?.trim():  ?. (optional chaining) prevents error if field is null or undefined. "Is this field empty after removing spaces"
        ) {//Optional chaining (?.) allows safe access to a property or method of an object that may be null or undefined, without throwing an error.
            throw new ApiError(400, "All fields are required")
            console.log(field)
        }

const existedUser = await User.findOne({
  $or: [{ email }, { username }]
})

if (existedUser) {
  console.log("User already exists:", existedUser)
  throw new ApiError(409, "User with email or username already exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
//this means if req.files exist then check for avatar and then check for path.
//get the local file path of the uploaded avatar image if it exists, otherwise set avatarLocalPath to undefined.
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
/*
//another way similar to above. It checks if req.files.coverImage exists and is an array with at least one element before accessing the path property of the first element.
let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
*/


if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
}

const avatarCloud = await uploadOnCloudinary(avatarLocalPath); //this uploads the avatar image to Cloudinary and returns the URL of the uploaded image.
const coverImageCloud = await uploadOnCloudinary(coverImageLocalPath);

//console.log("Avatar local path:", avatarLocalPath)
//console.log("Avatar cloud response:", avatarCloud)

if(!avatarCloud){
 throw new ApiError(500,"Could not upload avatar. Please try again later.") 
}

const user = await User.create({ //creates a mongodb User document..
    fullName, //Comes from frontend. Stored as-is.
    avatar: avatarCloud.url,
    coverImage:coverImageCloud?.url || "",
    email,
    username: username.toLowerCase(),
    password
})//creating user in db
/*
user = {
  _id: "abc123",
  username: "kuldeep",
  password: "hashedpassword",
  refreshToken: "...", ...
} //not safe to send to frontend cuz it contains sensitive info like password and refresh token.

*/

const createdUser = await User.findById(user._id).select( //.select() is used when fetching data from MongoDB to decide:which fields you WANT(no -) & which fields you DON’T want(prefix with -)
    "-password -refreshToken"
) //we fetch again cuz we want the same user without sensitive info like password and refresh token(“Give me this user, but hide password and refreshToken.).
/*Think of it like this 
create() → write operation (save this data)
findById() → read operation (show this data safely)*/

if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
} //if user creation failed crash safely

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
) //send response to frontend. frontend now knows user was created successfully.
})


const loginUser = asyncHandler(async(req,res)=>{
/* 
// Request body -> contains login credentials
// Accept login via username or email
// Find the user in the database
// Verify the password
// Generate access and refresh tokens
// Send tokens back as cookies
*/

//console.log("BODY =>", req.body)

const{username, password, email}=req.body

if(!(username || email)){
    throw new ApiError(400, "username or email required")
}

const user = await User.findOne({
    $or: [{username},{email}]
}) //user is a document (an instance) fetched from MongoDB meaning we cre
//`user` is the real data that came from the database
// It represents ONE actual user stored in MongoDB


if(!user){
    throw new ApiError(404, "username & email does not exists")
}

const isPasswordValid = await user.isPasswordCorrect(password) //isPasswordCorrect() is an instance method 
//if we use User instead of user it will give error cuz User is mongoose object (means it have access  to methods like findOne, deleteOne etc) 
//but the methods we made like isPasswordCorrect, generateAccessToken are instance methods which can be accessed only by the document (instance) fetched from the db.

// User contains many documents (many users).
// user is one specific document (one exact user stored in user variable).
// When we call user.isPasswordCorrect(password),
// it compares the entered password with that user’s stored password.
// If it matches → login successful.

/*If we call User.isPasswordCorrect() it gives an error because
User is the MongoDB/Mongoose model we created using a schema.
That model mainly exists to talk to the database
(find, create, update, delete documents).

Our custom methods like isPasswordCorrect() are not database methods.
They work on one specific user’s data, not on the whole collection.
user is a variable that holds one single document fetched from the DB,
so only user has access to our own instance methods. 


Model works with collections
Document works with data + logic
*/

if(!isPasswordValid){
    throw new ApiError(401, "invalid user credentials")
}

const {refreshToken, accessToken}= await generateAccessAndRefreshTokens(user._id) 
//We find the user using email or username, store that user in a variable, then use the user’s unique _id to 
//create access and refresh tokens so the backend can recognize that exact user on future requests and allow access.

//We fetch one specific user document using the user’s _id (got from the user instance), and from that document we send all non-sensitive fields to 
// the frontend, while intentionally excluding sensitive fields like password and refreshToken.
const loggedInUser = await User.findById(user._id)
.select("-password -refreshToken")

const options = {
    httpOnly: true, //prevents client-sdie JS from accessing the cookie (security measure against XSS attacks))
    secure: true //cookie sent only over HTTPS (ensures cookie is encrypted during transmission)
}

return res
.status(200)
.cookie("accessToken", accessToken, options) //creates a cookie named "accessToken" & uses secure, httpOnly settings
.cookie("refreshToken", refreshToken,options) //so now browser has both tokens stored as cookies, wwhen the browser stores the cookies, the user gets a 
                                        //smooth experience because they don’t have to log in again on every request.
.json(
    new ApiResponse(200,{
        user: loggedInUser, accessToken, refreshToken //sending tokens in response body is optional as we are sending them as httpOnly cookies
    },"user logged in successfullly"
)
)


})

const logoutUser = asyncHandler(async(req,res)=>{
    //reset cookies
    //reset refresh token in db
    await User.findByIdAndUpdate(
        req.user._id, //comes from verifyJWT middlerware "req.user = user". It’s the database ID of the currently logged-in user. 
        // Ensures you only update the user who is logged in.
        {
            $set:{ //$set is a MongoDB operator that updates the field you specify. This is crucial for logout → ensures no new access token can be generated.
                refreshToken : undefined
            }
        },
        {
            new : true //In Mongoose, findByIdAndUpdate by default returns the old document. new: true makes it return the updated document.
        }
    )

    const options = {
    httpOnly: true, 
    secure: true 
}

    return res
    .status(200)
    .clearCookie("accessToken", options) //we stored accessToken in key value pairs in login controller here we only need key
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out successfully"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
// get refresh token from cookies or request body
// if refresh token does not exist → unauthorized
// verify refresh token using refresh secret
// extract userId from decoded token
// find user in database using userId
// if user does not exist → unauthorized
// compare incoming refresh token with stored refresh token
// if mismatch → token expired or reused → unauthorized
// generate new access token AND new refresh token
// update refresh token in database (rotation)
// send new tokens as httpOnly secure cookies

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //Take refresh token from cookies if available, otherwise take it from request body

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET) //jwt.verify() compares the token’s signature.
                            //jwt.verify(token, SECRET)
    /*It takes the incoming refresh token, which has header, payload, signature. 
    It takes the secret from .env
    It re-creates a signature using header+paylaod+secret
    It compares the re-created signature with the signature in the incomingRefreshToken..
    If signature matches: Token was signed by your server,Token was not modified,Token is not expired
    it returns the payload (decodedToken) which contains data like _id if verification is successful.
    */ 
    
    /* 
    So decodedToken now has the payload/data from the refresh token, now we need to find the user using id, 
    as decodedToken is already a verified refresh token, it has the _id because we added _id in the payload when we created the refresh token.
    it will give use the user's document from the db.
    
    decodedToken does not contain the refresh token string, it contains the payload data like _id, which we added when creating the token, and MongoDB simply finds the user using that _id.
    */
        const user = await User.findById(decodedToken?._id) //_id comes from refreshToken paylaod remember we created method generateRefreshToken in user model and added _id in payload
    
        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "refresh token mismatch. possible token reuse")
        } //“Is the refresh token sent by the user the same one that the server last issued to this user?”
        //This check ensures that only the most recently issued refresh token can be used, preventing reuse of old or stolen refresh tokens.
        //I get a refresh token key, server stores the same key in DB, and whenever I re-login, a new key is generated and the old one is rejected.
    
        //if both are same we can generate new access and refresh tokens
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        //console.log("ROTATED ACCESS TOKEN =>", accessToken)
        //console.log("ROTATED REFRESH TOKEN =>", refreshToken)

        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("newrefreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, 
                {accessToken, refreshToken},
                "Access token refreshed successfully"
        )
    )
    } catch (error) {
        throw new ApiError(401, "invalid refresh token" )
    }


})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    // get old password and new password from req.body
    // get current user from req.user
    // validate old password
    // hash new password
    // update user's password in database
    // send success response

    const {oldPassword, newPassword} = req.body //old pass & new pass from frontend(can have confirm passsword too)

    const id = req.user?._id //current logged in user from verifyJWT middleware

    const user = await User.findById(id) //fetch user from db using id
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) //check if old password is correct

    if(!isPasswordCorrect){
        throw new ApiError(400, "Old password is incorrect")
    }

    user.password = newPassword //set new passwords
    await user.save({validateBeforeSave: false}) //save the user with new password. It will trigger pre-save middleware to hash the new password. 
    // validateBeforeSave: false skips re-validation of other fields.

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"password changed successfully")
    )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
}