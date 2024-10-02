import { Router } from "express";
import registerUser from "../controllers/registerUser.controller.js";
import { upload } from "../middleware/multer.middleware.js";
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
router.route("/login").post(registerUser)
export default router;
