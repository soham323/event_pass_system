import  {asyncHandler}  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"; 
import { User } from "../models/user.model.js";
import uploadCloudinary from "../services/cloudinary.js";
import { ApiRes } from "../utils/apiRes.js";

// register Organizer
const registerUser= asyncHandler(async (req,res)=>{
    // get user details from frontend
    //validation - not empty 
    // check if user already exists with email
    //check for images, profile image
    //upload on multer
    //upload to cloudinary,
    //create user object - create entry in db
    //remove password and refresh token feed from response
    // check for user creation 
    //return res

    const {name, email, password} = req.body;
    console.log("email: ",email,)
    if(
        [name,email,password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400,"All fields required");
    }

    //Checking if user already exist or not
    const existedUser = await User.findOne({
        email
    })
    if(existedUser){
        throw new ApiError(409,"User with email already exist! Please sign up with different email.")
    }

    // const profileImageLocalPath = req.files?.profileImage[0]?.path;
    let profileImageLocalPath;
    if(req.files && Array.isArray(req.files.profileImage) && req.files.profileImage.length > 0){
        profileImageLocalPath = req.files.profileImage[0].path;
    }

    if(!profileImageLocalPath){
        throw new ApiError(400,"profileImage Required")
    }
    const pfp = await uploadCloudinary(profileImageLocalPath)
    if(!pfp){
        throw new ApiError(400,"Failed to Upload image on cloudinary");
    }
    console.log("pfp file",pfp.url)

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        profileImage: pfp?.url || "",
    })
    const createdUser = await User.findById(user._id).select(
        "-password"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user!")
    }

    return res.status(201).json(
        new ApiRes(200,createdUser, "User Registered successfully!")
    )
});

// Register attendee
const registerAttendee = asyncHandler(async(req,res)=>{
    const {name, email, phoneNumber, password} = req.body;
    console.log("details",name,email,phoneNumber,password)
    if(!name || !email || !phoneNumber){
        throw new ApiError(401,"All Fields are required!")
    }

    const userAttendeeExist = await User.findOne(
        {$or:[{email}, {phoneNumber}]}
    ).select("-password");
    if(userAttendeeExist){
        throw new ApiError(400,"User already exist")
    }
    

    const userAttendee = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phoneNumber,
        role:"attendee",
    })
    const createdUserAttendee = await User.findById(userAttendee._id).select(
        "-password"
    )
    if(!createdUserAttendee){
        throw new ApiError(500,"Something went wrong while registering a user!")
    }

    return res.status(201).json(
        new ApiRes(200,createdUserAttendee, "User Registered successfully!")
    )
})

export  {registerUser, registerAttendee};