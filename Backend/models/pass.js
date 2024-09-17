import mongoose from "mongoose";

const generatePassId = () =>{
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `pass-${timestamp}_${randomNum}`;
}

const passSchema = new mongoose.Schema({
    passId:{
        type: String,
        require: true,
        unique: true,
        default: generatePassId,
    },
    eventName:{
        type: String,
        required: true,
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