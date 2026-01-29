import {Router} from "express"
import {loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1 
        },
        {
            name: "coverImage", 
            maxCount: 1
        }
    ]),
    registerUser)//http://localhost:8000/api/vi/users/register

    /* 
When THIS works:
req.files.picture[0].path

That line works only if the middleware is something like:
upload.fields([
  { name: "picture", maxCount: 1 }
])

Then Multer builds this structure:
req.files = {
  picture: [
    {
      fieldname: "picture",
      path: "uploads/img.png"
    }
  ]
}

So:
req.files ✅
.picture ✅
[0] ✅
.path ✅
Everything lines up like Lego bricks 🧱


Case 2: When THIS works 👇
req.file.path

Only when middleware is:
upload.single("picture")

Then Multer gives:
req.file = {
  path: "uploads/img.png"
}
*/

router.route("/login").post(loginUser)



//secured routes

/* 
The verifyJWT middleware runs before the controller and verifies the access token. 
After verification, it decodes the token and attaches the logged-in user’s data to req.user. 
Because of this, before the controller starts executing, the backend already knows which user is logged in. 
Using req.user._id, the controller can safely update that specific user’s data in the database without relying on the client to send a user ID.
*/

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router