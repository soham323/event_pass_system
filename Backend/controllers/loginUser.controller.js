import {ApiRes} from "../utils/apiRes.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import uploadOnCloudinary from "../services/cloudinary.js";

const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken=refreshToken;
        user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    }
    catch(e){
        throw new ApiError(500,"Something went wrong while generating Refresh and Access Token!",e);
    }
}


const loginUser = asyncHandler(async (req, res)=>{

    // Algo
    // Get data from req body
    // access will be on email based 
    // find the user if not found tell user to register password
    // if email validate check for password
    // if password is right access token and refresh token
    // send access token and refresh token with secure cookies
    // send success response

   // Get email and password from the request body
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and Password Required!");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist! Register first!");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password!");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Set secure cookies for access and refresh tokens
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRes(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }, "User Logged In Successfully!")
    );
});


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },
        {
            new: true,
        }
    )

    const options ={
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiRes(200,{},"User Logged Out!"))
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorize Request!")
    }

    try {
        const decodedIncomingRefreshToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedIncomingRefreshToken?._id)
        if(!user) {
            throw new ApiError(401,"Invalid Refresh Token!");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is Expired or Used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiRes(200,{
                accessToken,
                newRefreshToken
            },"Access Token Refreshed!")
        )
    } catch (error) {
        throw new ApiError(401,error?.message,"Invalid Refresh Token");
    }
})

// Change Password
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user =  await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Incorrect Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiRes(200,{},"New Password saved Successfully!"))
})

// Get Current User
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiRes(200, req.user, "Current User Fetched Successfully"))
})


//  Update Account Details
const updateUserDetails = asyncHandler(async(req,res)=>{
    const {name, email } = req.body
    if (!name || !email){
        throw new ApiError(400,"All Fields are Required!")
    }

    const userExist = await User.findOne({email});
    if(userExist){
        throw new ApiError(401, "User With this email already exist try different email!.")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                name,
                email,
            }
        },
        {new:true}
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    return res.status(200).json(new ApiRes(200,user, " Account Details updated Successfully!"))
})

// Update profile Image
const updateUserProfileImage = asyncHandler(async (req, res) => {
    // Ensure a file was uploaded
    if (!req.file) {
        throw new ApiError(400, "No file uploaded!");
    }

    // Upload the file to Cloudinary
    const result = await uploadOnCloudinary(req.file.path);

    // If the upload failed, throw an error
    if (!result || !result.url) {
        throw new ApiError(500, "Failed to upload image to Cloudinary.");
    }

    // Update the user's profile image URL in the database
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { profileImage: result.url } },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    // Return a success response
    return res.status(200).json(new ApiRes(200, user, "Profile image updated successfully!"));
});


export {
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserProfileImage
}