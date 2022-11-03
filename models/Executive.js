import mongoose from "mongoose";

const ExcoSchema = new mongoose.Schema({    
    name:{
        type: String,
        default:'',
        required:true
    },
    url:{
        type: String,
        default:'',
    }, 
    public_id:{
        type: String,
        default:'',
    }, 
    title:{
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

export default mongoose.model('Exco',ExcoSchema)