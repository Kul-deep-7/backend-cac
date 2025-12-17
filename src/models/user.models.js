import mongoose from "mongoose";
import bcrypt from "bcrpyt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
     {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)
//pre-save middleware-It runs automatically before a user document is saved to the database.
//To hash the password before storing it in MongoDB.
//used a regular function instead of arrow function to access "this" (this refers to the current user document)as arrow functions do not bind their own "this".
userSchema.pre("save", async function(next) {
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10); //The plain password becomes a hashed string.
    }
    next();
})

/*
// 1. User tries to save document
user.save()
// 2. This middleware runs
│
├── if password was changed?
│   ├── Yes → Hash it (takes ~100ms with cost 10)
│   └── No → Skip hashing
│
└── Call next() → Continue to save
// 3. Document saved with hashed password (or unchanged password)
*/

//custom method to check if hashed password matches
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password); //password → plain text password entered by the user (login). this.password → hashed password stored in the database
}

/*
Why compare is needed:
Passwords are stored as hashed values, so:
You cannot do password === this.password
You must use bcrypt.compare()
*/

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id : this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
            //payload name: value from the database
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}
 
/*
generateAccessToken() → short-lived proof of identity
generateRefreshToken() → long-lived token to get new access tokens

jwt.sign(payload, secret, options)
JWT has three parts:
Payload (data) who the user is||user data. never store passwords or secrets here
Secret (signature) signature key to prevent tampering. Backend verifies token using same secret
Expiry. it is short-lived to limit risk if stolen

in Refresh token, we store minimal data (_id only) to reduce risk if stolen
*/

const User = mongoose.model("User", userSchema)

export default User;    

/* 

Runtime flow (important)
Login

User logs in

Backend verifies password

Backend generates:

const accessToken = user.generateAccessToken()
const refreshToken = user.generateRefreshToken()


Access token → sent to client

Refresh token → stored securely (httpOnly cookie / DB)

*/