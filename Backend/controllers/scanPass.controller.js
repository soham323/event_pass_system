import { Pass } from "../models/pass.model.js"; 

// Controller to scan pass with mobile qr

export const scanPass = async (req, res) => {
  const { passId }= req.body;

  try {
    const pass = await Pass.findOne({
      passId 
    });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "Pass not found for this event",
      });
    }
    if (pass.scanned) {
      return res.status(400).json({
        success: false,
        message: "Pass already scanned!",
      })
    }

    // Scan pass if all above switch statements get false
    pass.scanned = true;
    await pass.save();

    res.status(200).json({
      success: true,
      message: "Pass Scanned Successfully!",
    })
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while Scanning pass",
      error: error.message,
    });
  }
};