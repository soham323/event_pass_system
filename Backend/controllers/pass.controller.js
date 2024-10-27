import { Event } from "../models/event.model.js";
import { Pass } from "../models/pass.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cryptoJS from "crypto-js";
// helper function
const generateRandomNumber = (length) => {
    const timestamp = Date.now().toString();
    const randomHash = cryptoJS.SHA256(timestamp + Math.random().toString()).toString();
    const randomNumber = randomHash.replace(/\D/g, '').slice(0, length);
    return randomNumber.padEnd(length, '0'); // Ensures we get exactly `length` digits
  };


const generateEventPasses = asyncHandler(async(req,res)=>{
    const {eventId} = req.params;
    const event = await Event.findById(eventId);
    console.log(event);
    if(!event){
        throw new ApiError(404, 'Event Not Found!');
    }

    // if number of passes are valid
    const numberOfPass = event.numberOfPasses || 0;
    console.log(numberOfPass);
    if(numberOfPass <= 0 || ""){
        throw new ApiError(400, "invalid number of passes please check your number of pass in event.")
    }

    //  pass doc array
    const passes = [];
    for(let i=1; i<=numberOfPass; i++){
        const randomPart = generateRandomNumber(5);
        const passCode = `${event.eventName}-${randomPart}-${i}`;
        console.log(passCode)
        passes.push({
            event: eventId,
            passHolderName: "Guest",
            passId: passCode,
            passType: event.ticketPrice > 0 ? "Paid" : "Free",
            ticketPrice: event.ticketPrice  ,
        });
    }
    //  Bulk insert passes in database
    const insertedPasses = await Pass.insertMany(passes);

    // updating event module with pass references
    await Event.updateOne(
        {_id: eventId},
        {$set:{passes: insertedPasses.map((pass) => pass._id)}}
    );

    return res.status(200).json(
        new ApiRes(200, { passes: insertedPasses.map(({ _id, passId, passHolderName, passType }) => ({ _id, passId, passHolderName, passType })) }, "Passes generated Successfully!")
);

})

export {generateEventPasses}