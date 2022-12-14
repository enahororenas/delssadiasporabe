import News from "../models/News.js"
import Exco from '../models/Executive.js'
import User from '../models/User.js'
import Project from "../models/Project.js"
import Comment from "../models/Comment.js"
import Event from "../models/Event.js"
import Gallery from "../models/Gallery.js"
import { StatusCodes } from 'http-status-codes'
import {BadRequestError, NotFoundError} from '../errors/index.js'
import checkPermissions from "../utils/checkPermissions.js"
import contactEmail from '../utils/emailSetup.js'
import cloudinary from '../utils/cloudinarySetup.js'
import  nodemailer from 'nodemailer'

const notifyEmail =async(email,message,username,action,old) =>{
        const client = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "dellssaadiaspora@gmail.com",
                pass: process.env.GMAILPASSWORD
            },
            tls: {rejectUnauthorized: false}
        });

        var sendSubject 
        var text
        if(action === 'replied') {
            sendSubject = username +" "+ action +" your comment"
            text = `
            Name: ${username}
            Response: ${message}
            `
        } else {
            sendSubject = username +" "+ action +" his/her comment" 
            text = `
            Name: ${username}
            Original : ${old}
            New Text: ${message}
            `
        }
        
        client.sendMail(
            {
                from: username,
                to: email,
                subject: sendSubject,
                text:text
            }
        )
}    

const createComment =async(req,res) =>{
    const{user,text,parentId,url} = req.body
    if(!text||!url){
        throw new BadRequestError('Please provide all values')
    }

    const username = user.fname +' '+user.lname
    const userId = user._id
    if(parentId){
        const parent = await Comment.findOne({_id:parentId})
        if(parent){
            const userToEmail = await User.findOne({_id:parent.userId})
            if(userToEmail){
                notifyEmail(userToEmail.email,text,username,'replied',null)
            }
        }   
    }

    const new_comment = await Comment.create({username,userId,text,url,parentId})
    res.status(StatusCodes.CREATED).json({new_comment})   
}

const updateComment =async(req,res) =>{
    const{text,id,parentId,user} = req.body
    const username = user.fname +' '+user.lname
    const old_comment = await Comment.findOne({_id:id})
    if(!old_comment){throw new NotFoundError('Existing Comment Not Found')}
    const new_comment = await Comment.findOneAndUpdate({_id:id},{text})
    if(parentId){
        const parent = await Comment.findOne({_id:parentId})
        if(parent){
            const userToEmail = await User.findOne({_id:parent.userId})
            if(userToEmail){
                notifyEmail(userToEmail.email,text,username,'edited',old_comment.text)
            }
        }   
    }
    res.status(StatusCodes.CREATED).json({new_comment}) 
}


const getComments =async(req,res) =>{
    //console.log('REQ',req.body)
    try{
        const totalComments = await Comment.find({})
        res.status(StatusCodes.OK).json(totalComments)
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not get comments' });
    }
}


const getAllMembers =async(req,res) =>{
    const { country, sort,search } = req.query
    //console.log('QRY INPUT',req.query,' = ',country, sort,search)

    try{   
      var queryObject
       
      if (!search || search === '') {  queryObject = {}}
      else {
        queryObject = {
            $or: [
                {lname: new RegExp(search, 'i')}, 
                {fname: new RegExp(search, 'i')}
                ] 
          }
      }

      if (country && country !== 'ALL') {queryObject.country = country}  
      
        let result = User.find(queryObject)
        
        if (sort === 'latest') { result = result.sort({_id:-1})}
        if (sort === 'oldest') {result = result.sort({_id:1})}
        if (sort === 'a-z') {result = result.sort('fname')}
        if (sort === 'z-a') {result = result.sort('-fname')}
        
        // setup pagination
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 9
        const skip = (page - 1) * limit
      
        result = result.skip(skip).limit(limit)
      
        const response = await result
        const totalMembers = await User.countDocuments(queryObject)
        const numOfPages = Math.ceil(totalMembers / limit)
      
        const members = response.map((user) =>({
        fname: user.fname,
        lname: user.lname,
        email:user.email,
        image: user.image,
        location:user.location,
        yog:user.yog,
        id:user._id,
        house:user.house,
        occupation:user.occupation,
        country:user.country,
        //company:user.company,
    }))
    //console.log(totalMembers,response.length)
    res.status(StatusCodes.OK).json({members,totalMembers,numOfPages})
    }  catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not get all members' });
    } 
}

const getNews =async(req,res) =>{
    const response = await News.find({})
    const news = response.map((file) => ({
        newsItem: file.newsItem,
        image: file.image,
        nid:file.nid,
        header:file.header
    }))
    res.status(StatusCodes.OK).json({news,totalNews:news.length})
    //res.send('get Tea')
}

const getAllImages =async(req,res) =>{
    try{
        //const { resources } = await cloudinary.search.expression('folder:Gallery').with_field('context').execute();
        const resources = await Gallery.find({})

        const urls = resources.map((file) => ({ 
        url: file.url,
        caption : file.caption
        }))

        // setup pagination
        const numOfImagePage = Math.ceil(urls.length / 7)
        res.status(StatusCodes.OK).json({urls,totalUrls:urls.length,numOfImagePage:numOfImagePage})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not get all images' });
    }  
}

const getAllPres =async(req,res) =>{
    try {const response = await Exco.find({pos:'pres'})
    const exPresident = response.map((mem) => ({
        name: mem.name,
        url: mem.url,
    }))
    res.status(StatusCodes.OK).json({exPresident,totalExPres:exPresident.length})
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
}


const getAllExco =async(req,res) =>{
    try {
        const response = await Exco.find({pos:'lead'})
        
        const excoMembers = []
        if (response){
            const ch1 = response.filter(mem => mem.title === 'Chairman')
            const ch2 = response.filter(mem => mem.title === 'Vice-Chairman')
            if(ch1.length > 0 ){
                excoMembers.push({
                    name: ch1[0].name,
                    url: ch1[0].url,
                    title:ch1[0].title,
                })
            }
            if(ch2.length > 0 ){
            excoMembers.push({
                    name: ch2[0].name,
                    url: ch2[0].url,
                    title:ch2[0].title,
                })
            }   
            for (const mem in response) {
                if(response[mem].title !== 'Chairman' && response[mem].title !== 'Vice-Chairman'){
                    excoMembers.push({
                        name: response[mem].name,
                        url:  response[mem].url,
                        title:response[mem].title,
                    })  
                }
            } 
        }

    const proj_res = await Exco.find({pos:'Project'})  
    const projMembers = []  
    if (proj_res){    
        const ch1 = proj_res.filter(mem => mem.title === 'Chairman')
        if(ch1.length > 0 ){
        projMembers.push({
            name: ch1[0].name,
            url: ch1[0].url,
            title:ch1[0].title,
            })
        }
        for (const mem in proj_res) {
            if(proj_res[mem].title !== 'Chairman'){
                projMembers.push({
                    name: proj_res[mem].name,
                    url:  proj_res[mem].url,
                    title:proj_res[mem].title,
                })  
            }
        } 
    }

    const media = await Exco.find({pos:'Media'})  
    const mediaMembers = []  
    if (media){    
        const ch1 = media.filter(mem => mem.title === 'Chairman')
        const ch2 = media.filter(mem => mem.title === 'Vice Chairman')
        const ch3 = media.filter(mem => mem.title === 'Secretary')

        if(ch1.length > 0 ){
        mediaMembers.push({
            name: ch1[0].name,
            url: ch1[0].url,
            title:ch1[0].title,
            })
        }
        if(ch2.length > 0 ){
        mediaMembers.push({
            name: ch2[0].name,
            url: ch2[0].url,
            title:ch2[0].title,
            })
        }
        if(ch3.length > 0 ){
        mediaMembers.push({
            name: ch3[0].name,
            url: ch3[0].url,
            title:ch3[0].title,
            })
        }    
        for (const mem in media) {
            if(media[mem].title !== 'Chairman' && media[mem].title !== 'Vice Chairman' && media[mem].title !== 'Secretary'){
                mediaMembers.push({
                    name: media[mem].name,
                    url:  media[mem].url,
                    title:media[mem].title,
                })  
            }
        } 
    }

    const welfare = await Exco.find({pos:'welfare'})  
    const welfareMembers = []  
    if (welfare){    
        const ch1 = welfare.filter(mem => mem.title === 'Chairman')
        const ch3 = welfare.filter(mem => mem.title === 'Secretary')
        if(ch1.length > 0 ){
        welfareMembers.push({
            name: ch1[0].name,
            url: ch1[0].url,
            title:ch1[0].title,
            })
        }
        if(ch3.length > 0 ){
        welfareMembers.push({
            name: ch3[0].name,
            url: ch3[0].url,
            title:ch3[0].title,
         })
        }
        for (const mem in welfare) {
            if(welfare[mem].title !== 'Chairman' && welfare[mem].title !== 'Secretary'){
                welfareMembers.push({
                    name: welfare[mem].name,
                    url:  welfare[mem].url,
                    title:welfare[mem].title,
                })  
            }
        } 
    }

    res.status(StatusCodes.OK).json({
        excoMembers,
        totalExco:excoMembers.length,
        projMembers,
        totalProject:projMembers.length,
        mediaMembers,
        totalMedia:mediaMembers.length,
        welfareMembers,
        totalWelfare:welfareMembers.length,
    })
    }catch(error){
        //console.log('error',error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
}


const deleteComment =async(req,res) =>{  
    try{
    const comment = await Comment.findOne({_id:req.body.commentId})
    if(!comment){throw new NotFoundError('Cant find comment to delete')}

    if(!comment.parentId){
        const allChildren = await Comment.find({parentId:req.body.commentId})
        const ids = allChildren.map( (item) => item._id);
        ids.push(comment._id)
        await Comment.deleteMany({'_id':{'$in':ids}})
    } else {
        await comment.remove()
    }
    res.status(StatusCodes.OK).json({msg:'Successfuly removed the comment'})
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
}

const deleteNews=async(req,res)=>{
    var check = []
    if(!req.body) {throw new BadRequestError('You must select an article')}
    for (const niv in req.body){ check.push(niv) }
    if(check.length === 0 ) {throw new BadRequestError('You must select an article')}
    try{
        await News.deleteMany({'nid':{'$in':check}})
        res.status(StatusCodes.OK).json({msg:'Successfuly deleted the news article'})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }   
}

const updateJob =async(req,res) =>{
    //console.log('UPDATE REQUEST',req.params,'BD',req.body)
    const{id:jobId} = req.params
    const{company,position} = req.body
    if(!position||!company){
        throw new BadRequestError('Please provide all values')
    }
    const job = await Job.findOne({_id:jobId})
    if(!job){throw new NotFoundError(`No job with id: ${jobId}`)}
    
    //console.log('USR',req.user.userId,'====',job.createdBy.toString())
    //check permission
    checkPermissions(req.user,job.createdBy)

    const updatedJob = await Job.findOneAndUpdate({_id:jobId},req.body,{
        new:true,
        runValidators:true,
    })
    res.status(StatusCodes.CREATED).json({updatedJob})
}


const sendEmail =async(req,res) =>{
    //console.log('SEND EMAIL SERVER',req.body,'AND',contactEmail)
    const {email,fname,lname,message} = req.body.body
    
    if(!email||!message||!lname||!fname){
        throw new BadRequestError('Please provide all values')
    }

    const name = fname+' '+lname
    try{
    const client = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "dellssaadiaspora@gmail.com",
            pass: process.env.GMAILPASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    await client.sendMail(
        {
            from: name,
            to: "dellssaadiaspora@gmail.com;diaspora@delssaa.org",
            subject: "DELSSAA DIASPORA CONTACT US FORM",
            text: `
            Name: ${name}
            Email: ${email}
            Message: ${message}
            `
        }
    )
    res.status(StatusCodes.OK).json({msg:'Email Sent Successfuly to DELLSSAA'})
    } catch(error){
        res.status(StatusCodes.OK).json({msg:error})
    }

    
    /*
    const mail = {
      from: name,
      to: "dellssaadiaspora@gmail.com",
      subject: "DELLSSAA DIASPORA Contact Form Submission",
      html: `<p>Name:${name}</p>
             <p>Email:${email}</p>
             <p>Message:${message}</p>`,
    };

    contactEmail.sendMail(mail, (error) => {
        if (error) {
            console.log('error',error)
            res.status(StatusCodes.OK).json({msg:error})
        } else {       
            res.status(StatusCodes.OK).json({msg:'Email Sent Successfuly to DELLSSAA'})
        }
      });
    */
    //res.send('show stats')
}

const addPres = async(req,res) => {
    const {pres,image,pos} = req.body
    //console.log(req.body)
    if(!pres || !image){ throw new BadRequestError('Please provide all values')}
    try {    
    const response = await cloudinary.uploader.upload(image,{  upload_preset: process.env.CLOUDINARY_EXCO})
    const item = {
        title: 'Past President',
        name : pres,
        url : response.secure_url,
        createdBy:req.user.userId,
        public_id: response.public_id,
        pos:pos
    }
    const leader = await Exco.create(item)
    res.status(StatusCodes.CREATED).json({leader})
    }  catch(error){ 
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not Add Ex President' });
    }
}    
const addLeader = async(req,res) => {
    const {Title,Name,image,pos} = req.body
    if(!Title || !Name || !image){ throw new BadRequestError('Please provide all values')}
    
    try {
        const exist = await Exco.findOne({title:Title,pos:pos})
        if(exist) {
            const del_response = await cloudinary.uploader.destroy(exist.public_id)
            await exist.remove()
        }    
    const response = await cloudinary.uploader.upload(image,{  upload_preset: process.env.CLOUDINARY_EXCO})
    const item = {
        title: Title,
        name : Name,
        url : response.secure_url,
        createdBy:req.user.userId,
        public_id: response.public_id,
        pos:pos
    }
    const leader = await Exco.create(item)
    res.status(StatusCodes.CREATED).json({leader})
    }  catch(error){ 
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not Add Exco Member' });
    }
}

const addImage = async(req,res) => {
    
    if(!req.body.allImages || req.body.allImages.length === 0 ){ throw new BadRequestError('Please provide all values')}
    
    try {
        const urls = []
        const multiplePicturePromise = req.body.allImages.map((picture) =>
            cloudinary.uploader.upload(picture,{  upload_preset: process.env.CLOUDINARY_GALLERY,
                context : {caption: req.body.caption},
            })
        );        
        const imageResponses = await Promise.all(multiplePicturePromise)

        for (const res in imageResponses){ 
            await Gallery.create({
                url:imageResponses[res].secure_url,
                public_id:imageResponses[res].public_id,
                caption:imageResponses[res].context.custom.caption,
                createdBy:req.user.userId})
            urls.push(imageResponses[res].secure_url)
        }
        
        res.status(StatusCodes.OK).json({url: urls})
    }  catch(error){ 
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not upload image' });
    }

//res.send('User Image Added')
}

const addNews = async(req,res) => {
   try {
        const{input} = req.body
        if(!input.newsItem||!input.head){ throw new BadRequestError('Please provide all values')}
        var response
        if(input.image && input.image !== '') { 
            response = await cloudinary.uploader.upload(input.image,{  upload_preset: process.env.CLOUDINARY_NEWS})    
        }
        var nid
        const lastEntry = await News.findOne().sort('-_id')
        if(lastEntry){ nid = lastEntry.nid + 1 }
        else {nid = 1}      
        const item = {
            newsItem :   input.newsItem,
            createdBy:req.user.userId,
            nid : nid,
            header: input.head
        }
        if(response){item.image = response.secure_url}
        //console.log('YESS',item)
        const news = await News.create(item)
        res.status(StatusCodes.CREATED).json({news})
    }  catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Could not add news item' });
    }
//res.send('News Item Added')
}

const addProject = async(req,res) => {
    const {topic,completed,total,unit} = req.body
    if(!topic||!completed||!total||!unit){ throw new BadRequestError('Please provide all values')}
    const projectAlreadyExists = await Project.findOne({topic})
    if(projectAlreadyExists) {throw new BadRequestError('Project previously added')}
    try{
        const new_project = await Project.create({topic,completed,total,unit,createdBy:req.user.userId})
        res.status(StatusCodes.CREATED).json({ msg: 'Successfuly Added New Project to DB'})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    } 
}

const getProject =async(req,res) =>{
    try {const response = await Project.find({})
    const projects = response.map((item) => ({
        topic: item.topic,
        completed: item.completed,
        unit:item.unit,
        total:item.total,
        donor:item.donor,
    }))
    res.status(StatusCodes.OK).json({projects,totalProject:projects.length})
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
}


const deleteProject =async(req,res) =>{
    const {topic,completed,total,unit} = req.body
    if(!topic||!completed||!total||!unit){ throw new BadRequestError('Please provide all values')}
    const projectAlreadyExists = await Project.findOne({topic})
    if(!projectAlreadyExists) {throw new BadRequestError('This project does not exist')}
    try{
        await projectAlreadyExists.remove()
        res.status(StatusCodes.CREATED).json({ msg: 'Successfuly Deleted Project'})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
}

const editproject =async(req,res) =>{
    const {topic,completed,total,unit,donor} = req.body
    if(!topic||!completed||!total||!unit){ throw new BadRequestError('Please provide all values')}
    const projectAlreadyExists = await Project.findOne({topic})
    if(!projectAlreadyExists) {throw new BadRequestError('This project does not exist')}
    projectAlreadyExists.completed = completed
    projectAlreadyExists.unit = unit
    projectAlreadyExists.total = total
    projectAlreadyExists.donor = donor
    try{
        await projectAlreadyExists.save()
        res.status(StatusCodes.CREATED).json({ msg: 'Successfuly Updated Project'})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    } 
}

const addEvent =async(req,res) =>{
    const {date,event} = req.body
    if(!date||!event){ throw new BadRequestError('Please provide all values')}
    const eventAlreadyExists = await Event.findOne({event})
    if(eventAlreadyExists) {throw new BadRequestError('This event already exists')}
    try{
        const new_event = await Event.create({event,date,createdBy:req.user.userId})
        res.status(StatusCodes.CREATED).json({ msg: 'Successfuly Added New Event to DB'})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
}

const getEvent = async(req,res) => {
    try {
    const response = await Event.find({})
    const events = response.map((item) => ({
        event: item.event,
        date: item.date,
    }))
    res.status(StatusCodes.OK).json({events,totalEvents:events.length})
    }catch(error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }   
}

const deleteEvent= async(req,res) => {
    var check = []
    if(!req.body) {throw new BadRequestError('You must select an article')}
    for (const niv in req.body){ check.push(req.body[niv]) }
    if(check.length === 0 ) {throw new BadRequestError('You must select an event')}
    try{
        await Event.deleteMany({'event':{'$in':check}})
        res.status(StatusCodes.OK).json({msg:'Successfuly deleted Event'})
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
     }
}

const updateNotification = async(req,res)=> {
    const user = await User.findOne({_id:req.user.userId})
    user.read=req.body.totalNews
    await user.save()
    res.status(StatusCodes.OK).json({user})
}

export {createComment,getAllExco, updateJob, updateComment,sendEmail,deleteComment,addLeader,addProject,
    addImage,getAllImages,addNews,getNews,getAllMembers,deleteNews,getComments,getProject,editproject,
    deleteProject,addEvent,getEvent,deleteEvent,updateNotification,addPres,getAllPres,
}