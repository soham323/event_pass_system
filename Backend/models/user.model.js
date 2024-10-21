import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    unique: true,
    required: true,
  },
  authMethod: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local',
  },
  googleId: {
    type: String,
    default: null,
  },
  appleId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['organizer', 'attendee'],
    default: 'organizer',
  },
  eventsCreated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  profileImage: {
    type: String,
    default: null,
  },
  paymentMethod: {
    upiId: String,
    cardDetails: {
      cardNumber: String,
      expiryDate: String,
      cardHolderName: String,
    },
  },
  refreshToken:{
    type: String,
  },
  accessToken:{
    type: String,
  }
});
userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

// Access Token 
userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      name:this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id:this._id,
  },
  process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  }
  )
}

export const User = mongoose.model('User', userSchema);
