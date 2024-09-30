import mongoose from 'mongoose';
import Pass from 'Pass.model.js';
const eventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventName: {
    type: String,
    require: true,
  },
  eventPhoto: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    default: '',
  },
  venue: {
    type: String,
    require: true,
    default: '',
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  isMultiDay: {
    type: Boolean,
    default: false,
  },
  passesGenerated: {
    type: Number,
    default: 0,
  },
  passesRemaining: {
    type: Number,
    default: 0,
  },
  ticketPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentGateway: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Net Banking'],
    default: 'UPI',
  },
  ticketActivation: {
    type: Boolean,
    default: false,
  },
  ticketExpiryAfterEvent: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pass',
    },
  ],
});

export const Event = mongoose.model('Event', eventSchema);
