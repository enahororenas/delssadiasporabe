import express from 'express'
import {register, login, updateUser,updateUsersImage,forgotPassword,valPassword,
    addNewUserToDB,makeAUserAdmin,getBday,getAnn} from '../controllers/authController.js'
import 'express-async-errors'
import authenticateUser from '../middleware/auth.js'

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/updateUser').patch(authenticateUser,updateUser)
router.route('/updateImage').post(updateUsersImage)
router.route('/addnewuser').post(addNewUserToDB)
router.route('/makeadmin').post(makeAUserAdmin)
router.route('/getbday').get(getBday)
router.route('/getann').get(getAnn)
router.route('/forgotpassword').post(forgotPassword)
router.route('/valpassword').post(valPassword)

export default router