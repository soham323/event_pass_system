import mongoose from "mongoose";

const passSchema = new mongoose.Schema({
    passId:{
        type: String,
        require: true,
        unique: true,
    },
    event:{
        type: String,
        required: false,
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