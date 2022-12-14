import express from 'express'
import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddleware from './middleware/error-handler.js'
import dotenv from 'dotenv'
import connectDB from './db/connect.js'
import authRouter from './routes/authRoutes.js'
import jobRouter from './routes/jobRouter.js'
import 'express-async-errors'
import axios from 'axios'

//import morgan from 'morgan'
import authenticateUser from './middleware/auth.js'
//import { dirname } from 'path'
//import { fileURLToPath } from 'url'
import path from 'path'
import cors from 'cors'
dotenv.config()

const app = express()

//if(process.env.NODE_ENV !== 'production'){app.use(morgan('dev'))}

app.use(
	cors({
		origin: [process.env.CLIENT_URL],
		credentials: true,
	})
);

//const __dirname = dirname(fileURLToPath(import.meta.url))
//app.use(express.static(path.resolve(__dirname, './client/build')))
//app.get('*', (req, res) => {res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))})

app.use(express.json({limit: '50mb'}))

//app.get('/',(req,res)=>{ res.send('WELCOME HOME!')})


app.use('/api/dias/auth',authRouter)
app.use('/api/dias/user',authenticateUser,jobRouter)
app.use('/api/dias/email',authenticateUser,jobRouter)
app.use('/api/dias/gallery',authenticateUser,jobRouter)
app.use('/api/dias/news',authenticateUser,jobRouter)
app.use('/api/dias/members',authenticateUser,jobRouter)
app.use('/api/dias/new',authenticateUser,authRouter)
app.use('/api/dias/comment',authenticateUser,jobRouter)
app.use('/api/dias/project',authenticateUser,jobRouter)
app.use('/api/dias/event',authenticateUser,jobRouter)

app.get("/keep-alive",(req,res)=>{ 
    //console.log(req.protocol+"://"+req.headers.host+req.originalUrl)
    res.send('Alive & Well')
})

app.use(notFoundMiddleware)
//error in any of the routes function
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000


const keepAlive = async()=> {
    try{
        const res = await axios.get(process.env.BE_URL+'/keep-alive');
        //console.log(res.data)
    }  catch(error){
        console.log('*****ALERT:: Keep Alive is DEAD******')
    }  
}
//setInterval(keepAlive,600000);
//setInterval(keepAlive,3600000);


const start = async() => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port,() => {
            console.log(`server is listening on port ${port}`)
        })
    } catch (error){console.log(error)}
}
start()
