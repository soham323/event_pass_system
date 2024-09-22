import crypto from "crypto";
import { Pass } from "../models/pass.model.js"; 
import { Event } from "../models/event.model.js";

// Helper function to generate unique pass id
const generatePassId = (eventName, counter) =>{
  const randomString = crypto.randomBytes(4).toString('hex');
  return `${eventName}-${randomString}-${counter}`;
}

export const createEvent = async (req, res) => {
  const { eventName, eventPhoto, numberOfPasses } = req.body;
  
  //function to Create event and save in database
  try {
    const newEvent = new Event({
      name: eventName,
      photoUrl: eventPhoto,
      totalPasses: numberOfPasses,
    });
    await newEvent.save();

    // function to create unique passes for the event
    let counter = 1;
    for (let i = 0; i < numberOfPasses; i++){
      const passId = generatePassId(eventName, counter++);
      const newPass = new Pass({
        passId,
        eventId: newEvent._id,
      });
      await newPass.save();
    }

    res.status(200).json({
      success: true,
      message: "Event and passes generated successfully!",
    })
  } catch (error){
    res.status(500).json({
      success: false,
      message: "Error creating event or generating passes",
      error: error.message,
    });
  }
}




















// import { Pass } from "../models/pass.model.js"; 

// const generatePass =  async (req, res) => {
//     const {qrCode, eventName} = req.body;     
//     try {
//       const newPass = new Pass({
//         qrCode,
//         eventName,
//       });
  
//       await newPass.save();
//       res.status(201).json({
//         success: true,
//         message: "Pass Generated successfully!",
//         pass: newPass,
//       })
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error generating pass",
//         error: error.message
//       });
//       console.log("Error: ", error);
//     }
//   };
  
//   export default generatePass;  