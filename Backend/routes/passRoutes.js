import express from "express";
import QRCode from "qrcode";
import { Pass } from "../models/pass.js"; 

const router = express.Router();

router.post('/generate', async (req, res) => {
  const {qrCode, eventName} = req.body;
  try {
    const newPass = new Pass({
      qrCode,
      eventName,
    });

    await newPass.save();
    res.status(201).json({
      success: true,
      message: "Pass Generated successfully!",
      pass: newPass,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating pass",
      error: error.message
    });
    console.log("Error: ", error);
  }
});

// Scan a pass
router.post('/scan', async (req, res) => {
  try {
    const { passId, eventName } = req.body;

    // Find the pass based on both qrData and eventName
    const pass = await Pass.findOne({ passId, eventName });

    // If no pass found, return an error
    if (!pass) {
      return res.status(404).json({ 
        message: 'Pass not found for this event',
       });
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
