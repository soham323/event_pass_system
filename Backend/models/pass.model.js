import mongoose from 'mongoose';

const passSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  passHolderName: {
    type: String,
    default: 'Guest',
  },
  passId: {
    type: String,
    unique: true,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  scanned: {
    type: Boolean,
    default: false,
  },
  scannedAt: {
    type: Date,
    deafault: null,
  },
  passType: {
    type: String,
    enum: ['Free', 'Paid'],
    default: 'Free',
  },
  ticketPrice: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Pass = mongoose.model('Pass', passSchema);
