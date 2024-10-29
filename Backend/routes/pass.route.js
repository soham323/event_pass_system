import { Router } from "express"; 
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { confirmPassPurchase, generateEventPasses, preparePassPurchase } from "../controllers/pass.controller.js";
const router = Router();

router.route("/generatePasses/:eventId").post(verifyJWT, generateEventPasses);


// prepare to purchase pass
router.route("/preparePassPurchase/:eventId").post(verifyJWT, preparePassPurchase);

// confirm purhchased pass and update in database
router.route("/confirmPassPurchase/:eventId").post(verifyJWT, confirmPassPurchase);
export default router;