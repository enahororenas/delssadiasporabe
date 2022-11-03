import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({    
    newsItem:{
        type: String,
        default:'',
        required:true
    },
    image:{
        type: String,
        default:'',
    }, 
    header:{
        type: String,
        default:'',
    }, 
    createdBy:{
        type: mongoose.Types.ObjectId,
        required: [true,'please provide User'],
        ref:'User'
    },
    nid:{
        type: Number,
        unique:true
    },
},{timestamps:true}
)

export default mongoose.model('News',NewsSchema)