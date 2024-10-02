import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
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
});
userSchema.pre("save", async function (next)){
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
}

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}
export const User = mongoose.model('User', userSchema);
