import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
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
        process.env.ACCESS_TOKEN_SECRET, //secret key to sign the token or password
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,//instruction 
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
Secret (signature) signature key to prevent tampering. Backend verifies token using same secret(The Signature is the result of a mathematical "mixing" of the Header, Payload, and your Secret Key using cryptographic algorithm)
You don’t explicitly write the Header in your code because the library generates it for you by default.(What is in it: It typically looks like { "alg": "HS256", "typ": "JWT" })o
Expiry. it is short-lived to limit risk if stolen (This isn't its own "part" of the JWT string, but rather a set of instructions for the library on how to build the Payload and Header)
in Refresh token, we store minimal data (_id only) to reduce risk if stolen

When you call jwt.sign() in your code, the library follows this exact recipe:
Encode Header: Turns the header JSON into a Base64URL string.
Encode Payload: Turns your user data object into a Base64URL string.
Combine them: Joins them with a dot (Header.Payload).
Add the Secret: It takes that combined string and "mixes" it with your Secret Key using a cryptographic algorithm (like HS256).
Final Result: The output of that process is the Signature. 
*/

const User = mongoose.model("User", userSchema)

export {User};


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


The Mathematical Formula
Technically, JWT looks like this:
Signature = HMACSHA256(Base64Url(Header) + "." + Base64Url(Payload), Secret). 
Why this matters for your Backend
When the user sends the token back to you later, your backend does the same math again:
It takes the Header and Payload the user sent.
It grabs the Secret Key from your .env.
It re-calculates the signature.
The Test: If your newly calculated signature matches the one the user sent, the token is Valid. If they don't match, someone tampered with the data
*/