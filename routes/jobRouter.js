import express from 'express'
import {createComment,sendEmail,addImage,getAllImages,updateComment,deleteComment,addLeader,getAllExco,
    addNews,getNews,getAllMembers,deleteNews,getComments} from '../controllers/jobsController.js'
const router = express.Router()
router.route('/sendemail').post(sendEmail)
router.route('/addimage').post(addImage).get(getAllImages)
router.route('/addnewsitem').post(addNews).get(getNews)
router.route('/getmembers').get(getAllMembers)
router.route('/deletenewsitem').post(deleteNews)
router.route('/add').post(createComment)
router.route('/get').post(getComments)
router.route('/update').post(updateComment)
router.route('/delete').post(deleteComment)
router.route('/addleader').post(addLeader).get(getAllExco)


export default router