import express from 'express'
import {register, login, updateUser,updateUsersImage,forgotPassword,valPassword,
    addNewUserToDB,makeAUserAdmin,getBday,getAnn,wakeUp} from '../controllers/authController.js'
import 'express-async-errors'
import authenticateUser from '../middleware/auth.js'

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/wake').post(wakeUp)
router.route('/forgotpassword').post(forgotPassword)
router.route('/valpassword').post(valPassword)
router.route('/updateUser').patch(authenticateUser,updateUser)
router.route('/updateImage').post(authenticateUser,updateUsersImage)
router.route('/addnewuser').post(authenticateUser,addNewUserToDB)
router.route('/makeadmin').post(authenticateUser,makeAUserAdmin)
router.route('/getbday').get(authenticateUser,getBday)
router.route('/getann').get(authenticateUser,getAnn)

export default router