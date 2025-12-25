import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

const registerUser = asyncHandler(async(req,res)=>{
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
    console.log("email:",email)


    if(!fullName || fullName.trim()===""){
        throw new ApiError(400,"Name is required")
    }else if(!email || email.trim()===""){
        throw new ApiError(400,"Email is required")
    }else if(!password || password.trim()===""){
        throw new ApiError(400,"Password is required")
    }else if(!username || username.trim()===""){
        throw new ApiError(400,"Username is required")
    }
    })

export default registerUser