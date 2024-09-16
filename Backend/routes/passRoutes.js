import express from "express";
import QRCode from "qrcode";
import { Pass } from "../models/pass.js"; 

const router = express.Router();

router.post('/scan', async (req, res) => {
  try {
    const { qrData } = req.body;

    // Ensure that you initialize the pass variable correctly
    const pass = await Pass.findOne({ qrCode: qrData });

    // If no pass found, return an error
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    // If pass is already scanned, return an error
    if (pass.scanned) {
      return res.status(400).json({ message: 'Pass already scanned' });
    }

    // Mark the pass as scanned
    pass.scanned = true;
    await pass.save();

    // Respond with success
    res.status(200).json({ message: 'Pass scanned successfully', pass });
  } catch (error) {
    console.error('Error while scanning the pass:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;