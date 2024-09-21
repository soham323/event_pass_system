import { Pass } from "../models/pass.js"; 

const generatePass =  async (req, res) => {
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
  };
  
  export default generatePass;  