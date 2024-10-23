import { Router } from "express";
import registerUser from "../controllers/registerUser.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, updateUserDetails, updateUserProfileImage } from "../controllers/loginUser.controller.js";
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

//Get User Information Route
router.route("/getUser").get(verifyJWT, getCurrentUser)

// Change User Current Password
router.route("/changePassword").post(verifyJWT, changeCurrentPassword)

// Update User Details Route
router.route("/updateUser").patch(verifyJWT, updateUserDetails)

//Update Profile Image
router.route("/updateProfileImage").patch(verifyJWT, 
    upload.single("profileImage"), updateUserProfileImage
)
//refreshToken
router.route("/refreshAccessToken").post(refreshAccessToken)
export default router;
