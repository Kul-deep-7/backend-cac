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

userSchema.pre("save", async function(next) {
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
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
   return await bcrypt.compare(password, this.password); 
}



const User = mongoose.model("User", userSchema)

export default User;    