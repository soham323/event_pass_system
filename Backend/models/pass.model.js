import mongoose, { mongo } from "mongoose";

const passSchema = new mongoose.Schema({
    passId:{
        type: String,
        require: true,
        unique: true,
    },
    eventId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Event',
        required: true
    },
    scanned:{
        type: Boolean,
        required: true,
        default: false,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
})


export const Pass = mongoose.model('Pass', passSchema);