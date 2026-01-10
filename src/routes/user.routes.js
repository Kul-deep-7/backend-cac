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