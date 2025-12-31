import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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
         )//field?.trim():  ?. (optional chaining) prevents error if field is null or undefined. "Is this field empty after removing spaces?"
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

const{username, password, email}=req.body

if(!username || !email){
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
// user is one specific document (one exact user).
// When we call user.isPasswordCorrect(password),
// it compares the entered password with that user’s stored password.
// If it matches → login successful.

if(!isPasswordValid){
    throw new ApiError(401, "invalid user credentials")
}




})

export {
    registerUser,
    loginUser
}