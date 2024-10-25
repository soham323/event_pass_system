import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { ApiRes } from "../utils/apiRes.js";
import uploadOnCloudinary from "../services/cloudinary.js";

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



export { createEvent };
