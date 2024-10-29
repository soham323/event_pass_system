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

const preparePassPurchase = asyncHandler(async(req, res)=>{
    const {eventId} = req.params;
    console.log(eventId);
    const {numberOfPasses, buyerName} = req.body;
    console.log(numberOfPasses)
    // validity check for number of passes and buyer name
    if(!numberOfPasses || !buyerName){
        throw new ApiError(401, "Please Specify number of passes and your name!")
    }

    const event =  await Event.findById(eventId).select("eventName eventPhoto description venue startDateTime endDateTime ticketPrice");
    if(!event){
        throw new ApiError(400,"Event Not found! ")
    }

    const totalPrice =  event.ticketPrice * numberOfPasses;

    // responsing total amount of bill
    res.status(200).json(
        new ApiRes(200, {totalPrice, event, buyerName}, "Total bill info of passes purchase!")
    )
})

// confirm pass purchase controller 
// To DO: - this will be run after successfull payment
const confirmPassPurchase = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { buyerName, numOfPasses } = req.body;
    console.log(buyerName)
    console.log(numOfPasses)
    if(!numOfPasses || !buyerName){
        throw new ApiError(401, "BuyerName or Number of passes not defined");
    }
    // Find available passes for the event
    const passes = await Pass.find({
      event: eventId,
      passSold: false,
    }).limit(numOfPasses);
  
    if (passes.length < numOfPasses) {
      throw new ApiError(400, "Not enough available passes");
    }
  
    // Get the IDs of the passes to update
    const passIds = passes.map((pass) => pass._id);
  
    // Mark the passes as sold and set the buyer's name
    await Pass.updateMany(
      { _id: { $in: passIds } },
      { $set: { passSold: true, passHolderName: buyerName } }
    );
  
    // Fetch and return the updated passes to include in the response
    const updatedPasses = await Pass.find({ _id: { $in: passIds } });
  
    res.status(200).json(new ApiRes(200, { purchasedPasses: updatedPasses }, "Passes marked as sold and details retrieved successfully"));
  });



export {generateEventPasses, preparePassPurchase, confirmPassPurchase}