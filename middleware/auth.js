import { UnAuthenticatedError } from "../errors/index.js"
import jwt from "jsonwebtoken"
const auth = async(req,res,next) => {
    console.log(req.originalUrl)
    const authHeader = req.headers.authorization
    // /console.log('Auth Middle ware ERROR Called')
   // console.log('Auth User in Middle ware Called',authHeader)

   if(!authHeader||!authHeader.startsWith('Bearer')){
    throw new UnAuthenticatedError('Authentication Invalid')
   } 
   const token = authHeader.split(' ')[1]
   //console.log('VERIFY THIS TOKEN',token)
   try{
    const payload = jwt.verify(token,process.env.JWT_SECRET)
    req.user = {userId:payload.userId}
    //console.log(payload.exp)
   }catch (error){
    throw new UnAuthenticatedError('Authentication Invalid')
   }
    next()
}

export default auth