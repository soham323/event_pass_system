import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createEvent } from "../controllers/event.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();
//route to create event and their passes
router.post("/createEvent", upload.fields([
    {
        name: "eventPhoto",
        maxCount: 1,
    }
]),
    verifyJWT, createEvent
)


export default router;

