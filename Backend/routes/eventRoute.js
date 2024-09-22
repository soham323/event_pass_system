import express from "express";
import { createEvent } from "../controllers/createEvent.controller.js";
import { getEventPasses } from "../controllers/fetchPasses.controller.js";
const router = express.Router();
router.post('/create-event', createEvent);
router.get('/event/:eventId/passes', getEventPasses);
export default router;