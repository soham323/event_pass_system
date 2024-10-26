import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { ApiRes } from "../utils/apiRes.js";
import uploadOnCloudinary from "../services/cloudinary.js";
import { Pass } from "../models/pass.model.js";

// Controller to create an event
const createEvent = asyncHandler(async (req, res) => {
  const {
    eventName,
    description,
    venue,
    numberOfPasses,
    ticketPrice,
    startDateTime,
    endDateTime,
  } = req.body;

  // Required fields validation
  if (!eventName || !description || !venue || !numberOfPasses || !ticketPrice || !startDateTime || !endDateTime) {
    throw new ApiError(400, "Please fill in all required details!");
  }

  // Check if an event with the same name already exists
  const existingEvent = await Event.findOne({ eventName });
  if (existingEvent) {
    throw new ApiError(400, "An event with the same name already exists!");
  }

  // Parse and validate date fields
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (isNaN(start) || isNaN(end)) {
    throw new ApiError(400, "Invalid date format. Please provide valid start and end dates.");
  }

  if (start >= end) {
    throw new ApiError(400, "Start date must be before end date.");
  }


  // Getting the logged-in user's id
  const organizerId = req.user._id;

  // Upload event photo to Cloudinary
  let eventPhotoUrl = "";
  if (req.files && req.files.eventPhoto && req.files.eventPhoto[0]) {
    const photoPath = req.files.eventPhoto[0].path;
    const uploadedPhoto = await uploadOnCloudinary(photoPath);
    if (!uploadedPhoto) {
      throw new ApiError(400, "Event photo upload failed.");
    }
    eventPhotoUrl = uploadedPhoto.url;
  }

  // Creating the event
  const event = await Event.create({
    organizer: organizerId,
    eventName,
    description,
    venue,
    numberOfPasses,
    ticketPrice,
    startDateTime: start,
    endDateTime: end,
    eventPhoto: eventPhotoUrl,
  });

  return res.status(201).json(new ApiRes(201, { event }, "Event created successfully!"));
});

// controller to update event
const updateEvent = asyncHandler(async (req, res) => {
  const {
    eventName,
    description,
    venue,
    numberOfPasses,
    ticketPrice,
    startDateTime,
    endDateTime,
  } = req.body;
  const { eventId } = req.params
  console.log(eventId)
  console.log(eventName)
  // Checking if event exist with event id
  const event = await Event.findById(eventId)
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // checking for same event name
  const eventExist = await Event.findOne({ eventName });
  if (eventName && eventName !== event.eventName) {
    const eventExist = await Event.findOne({ eventName, _id: { $ne: eventId } });
    if (eventExist) {
      throw new ApiError(401, "Event with the same name exists. Please choose another name.");
    }
  }
  // handling event photo update 
  if (!req.file) {
    throw new ApiError(400, "No file uploaded!");
  }

  // Upload the file to Cloudinary
  const result = await uploadOnCloudinary(req.file.path);

  // If the upload failed, throw an error
  if (!result || !result.url) {
    throw new ApiError(500, "Failed to upload image to Cloudinary.");
  }

  // Parse and validate date fields
  const start = startDateTime ? new Date(startDateTime) : event.startDateTime;
  const end = endDateTime ? new Date(endDateTime) : event.endDateTime;

  if ((startDateTime && isNaN(start)) || (endDateTime && isNaN(end))) {
    throw new ApiError(400, "Invalid date format. Please provide valid start and end dates.");
  }

  if (start >= end) {
    throw new ApiError(400, "Start date must be before end date.");
  }


  const updatedEvent = await Event.findByIdAndUpdate(
    eventId, {
    $set: {
      eventName: eventName || event.eventName,
      description: description || event.description,
      venue: venue || event.venue,
      numberOfPasses: numberOfPasses || event.numberOfPasses,
      ticketPrice: ticketPrice || event.ticketPrice,
      startDateTime: start || event.startDateTime,
      endDateTime: end || event.endDateTime,
      eventPhoto: result.url || event.eventPhoto,
    }
  },
    { new: true }
  )

  if (!updatedEvent) {
    throw new ApiError(400, "Failed to updated event information!")
  }

  // final api response if no error occur
  return res.status(200).json(new ApiRes(
    200,
    updatedEvent,
    "Event information updated Successfully!"
  ))
});

// controller to fetch event details
const getEventDetails = asyncHandler(async (req, res)=>{
  const {organizerId} = req.params;
  const events = await Event.find({organizer:organizerId})
  .populate("passes")
  .lean()

  // If event not found
  if (!events || events.length === 0) {
    throw new ApiError(404, "No events found for the organizer.");
  }

  res.status(200).json(
    new ApiRes(200, events, "organizers events fetched successfully!")
  )
})

// controller to delete event
const deleteEvent = asyncHandler(async (req, res)=>{
  const {eventId} = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // delete event with passes
  // await Pass.deleteMany({_id: {$in:event.passes}});

  // delete event
  await Event.findByIdAndDelete(eventId);

  return res.status(200).json(
    new ApiRes(200,null ,"Event deleted successfully!")
  )
})

export {
  createEvent,
  updateEvent,
  getEventDetails,
  deleteEvent,
};
