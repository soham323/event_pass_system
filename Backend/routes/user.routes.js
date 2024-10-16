import { Router } from "express";
import registerUser from "../controllers/registerUser.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { loginUser, logoutUser, refreshAccessToken } from "../controllers/loginUser.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"profileImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

// Secured Routes   
router.route("/logout").post(verifyJWT,logoutUser)

//refreshToken
router.route("/refreshAccessToken").post(refreshAccessToken)
export default router;
