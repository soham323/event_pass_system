import {ApiRes} from "../utils/apiRes.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


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

export {
    loginUser,
    logoutUser,
    refreshAccessToken,
}