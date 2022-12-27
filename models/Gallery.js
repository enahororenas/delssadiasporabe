import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
    public_id:{
        type: String,
        minlength:1,
        unique:true,
    },
    url:{
        type: String,
        minlength:1,
    },
    caption:{
        type: String,
        minlength:1,
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        required: [true,'please provide User'],
        ref:'User'
    }
},{timestamps:true})

export default mongoose.model('Gallery',GallerySchema)