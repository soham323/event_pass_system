import express from "express";
import QRCode from "qrcode";
import generatePass from "../controllers/generatePass.controller.js";
import scanPass from "../controllers/scanPass.controller.js";
const router = express.Router();

// pass routes
router.post("/generate", generatePass); // route for generate pass controller
router.post("/scan", scanPass); // route to scan pass controller

export default router;
