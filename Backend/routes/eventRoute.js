import { Router } from "express"; 
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createEvent, deleteEvent, getEventDetails, updateEvent } from "../controllers/event.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
//route to create event and their passes
router.post("/createEvent",verifyJWT, upload.fields([
    {
        name: "eventPhoto",
        maxCount: 1,
    }
]),
 createEvent
)

//Update Event Route
router.route("/updateEvent/:eventId").patch(verifyJWT,upload.single("eventPhoto"), updateEvent)

// get Event details route
router.route("/getEventDetails/:organizerId").get(verifyJWT,getEventDetails);

// Route to delete an event
router.route("/deleteEvent/:eventId").delete(verifyJWT, deleteEvent)

export default router;

