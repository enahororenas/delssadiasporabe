import mongoose from "mongoose";

const ExistSchema = new mongoose.Schema({
    fname:{
        type: String,
        maxlength:50,
        minlength:3,
    },
    lname:{
        type: String,
        maxlength:50,
        minlength:3,
    },
    email:{
        type: String,
        maxlength:50,
        unique:true,
        minlength:3,
    },
})

export default mongoose.model('MainDB',ExistSchema)