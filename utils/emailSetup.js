import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const contactEmail = nodemailer.createTransport({
    
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD,
    }
  });

  export default contactEmail