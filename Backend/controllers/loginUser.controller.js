import {ApiRes} from "../utils/apiRes.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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

    // Get email from body
    const {email, password} = req.body;
    
    // Checking if email and password is received or not
    if(!email||!password) {
        throw new ApiError(400, "Email and Password Required!");
    }
    // Email missing
    if(!email){
        throw new ApiError(400,"Email Required!");
    }
    // password missing
    if(!password){
        throw new ApiError(400,"Password Required!");
    }

    // Checking if user already exist or not with email
    const user = User.findOne(email)
    if(!user){
        throw new ApiError(404,"User does not exist! Register first!")
    }
    // Validating user with password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect Password!");
    }
    // generating access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Making cookies
    const options ={
        httpOnly:true,
        secure:true,
    }
    return res.
    status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiRes(200,{
            user:loggedInUser,
            accessToken,
            refreshToken,
        },"User Logged In Successfully!")
    )
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


export {
    loginUser,
    logoutUser
}