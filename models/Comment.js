import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    text:{
        type: String,
        minlength:1,
    },
    url:{
        type: String,
        minlength:1,
    },
    username:{
        type: String,
        maxlength:500,
        minlength:3,
    },
    userId:{
        type: String,
        minlength:3,
    },
    parentId:{
        type: String,
    },
},{timestamps:true})

export default mongoose.model('Comment',CommentSchema)