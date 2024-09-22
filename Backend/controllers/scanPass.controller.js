import { Pass } from "../models/pass.model.js"; 

const scanPass = async (req, res) => {
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
  };

  export default scanPass;
  