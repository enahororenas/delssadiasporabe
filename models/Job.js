import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    company:{
        type: String,
        required: [true,'please provide company'],
        maxlength:50
    },
    position:{
        type: String,
        required: [true,'please provide position'],
        maxlength:100
    },
    status:{
        type: String,
        enum: ['interview','declined','pending'],
        default:'pending'
    },
    jobType:{
        type: String,
        enum: ['full-time','part-time','remote','internship'],
        default:'remote'
    },
    jobLocation:{
        type: String,
        default:'my city',
        required:true
    }, 
    createdBy:{
        type: mongoose.Types.ObjectId,
        required: [true,'please provide User'],
        ref:'User'
    },
},{timestamps:true}
)

export default mongoose.model('Job',JobSchema)