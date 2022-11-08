import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({    
    event:{
        type: String,
        default:'',
        required:true,
        unique:true
    }, 
    date:{
        type: String,
        default:'',
    }, 
    createdBy:{
        type: mongoose.Types.ObjectId,
        required: [true,'please provide User'],
        ref:'User'
    }
},{timestamps:true}
)

export default mongoose.model('Event',EventSchema)