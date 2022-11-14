import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

const DUserSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: [true,'please provide firstName'],
        minlength:3,
        maxlength:20,
        trim:true,
    },
    lname:{
        type:String,
        maxlength:20,
        trim:true,
        required: [true,'please provide lastName'],
        minlength:3,
    },
    email:{
        type:String,
        required: [true,'please provide your email'],
        validate:{
        validator:validator.isEmail,
        message:'Please provide a valid email',
        },
        unique:true
    },
    password:{
        type:String,
        required: [true,'please provide your password'],
        minlength:6,
        select:false,
    },
    location:{
        type:String,
        maxlength:20,
        trim:true,
        default:'my city'
    },
    image:{
        type:String,
        default:''
    },
    public_id:{
        type:String,
        maxlength:500,
        default:''
    },
    read:{
        type:Number,
        default:0,
    },
    occupation:{
        type:String,
        maxlength:500,
        default:'',
        trim:true,
    },
    teacher:{
        type:String,
        maxlength:200,
        default:'',
        trim:true,
    },
    subject:{
        type:String,
        maxlength:200,
        default:'',
        trim:true,
    },
    yog:{
        type:String,
        maxlength:200,
        default:'',
        trim:true,
    },
    house:{
        type:String,
        maxlength:100,
        default:'',
        trim:true,
    },
    bday:{
        type:String,
        maxlength:500,
        default:''
    },
    admin:{
        type:Boolean,
        default:false,
    },
    resetPasswordToken: {type:String},
    resetPasswordExpires: {type:Date},
})

DUserSchema.pre('save',async function(){
    if(!this.isModified('password')) return
    const salt =await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})


DUserSchema.methods.createJWT = function(){
    return jwt.sign({userId:this._id},process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_LIFETIME
        })
}

DUserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword,this.password)
    return isMatch
}

export default mongoose.model('User',DUserSchema)