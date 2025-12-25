import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"

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

    const existedUser= await User.findOne({
        $or: [{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

})

export {registerUser}