import { Router } from "express"; 
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { generateEventPasses } from "../controllers/pass.controller.js";
const router = Router();

router.route("/generatePasses/:eventId").post(verifyJWT, generateEventPasses);

export default router;