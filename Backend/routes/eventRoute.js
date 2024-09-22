import express from "express";
import { createEvent } from "../controllers/createEvent.controller.js";
import { getEventPasses } from "../controllers/fetchPasses.controller.js";
import { scanPass } from "../controllers/scanPass.controller.js";   
const router = express.Router();
//route to create event and their passes
router.post('/create-event', createEvent);

// route to get all passes data
router.get('/event/:eventId/passes', getEventPasses);

// route to scan a pass
router.post("/scan-pass", scanPass);

export default router;

