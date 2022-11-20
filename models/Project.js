import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({    
    topic:{
        type: String,
        default:'',
        required:true,
        unique:true
    },
    completed:{
        type: String,
        default:'0',
    }, 
    unit:{
        type: String,
        default:'',
    }, 
    donor:{
        type: String,
        default:'',
    }, 
    total:{
        type: String,
        default:'',
        required:true
    }, 
    createdBy:{
        type: mongoose.Types.ObjectId,
        required: [true,'please provide User'],
        ref:'User'
    }
},{timestamps:true}
)

export default mongoose.model('Project',ProjectSchema)