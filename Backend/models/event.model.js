import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
    },
    photoUrl:{
        type: String,
    },
    totalPasses: {
        type: Number,
        require: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
});

export const Event = mongoose.model('Event', eventSchema)