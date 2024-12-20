import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

export async function sendMail(email, emailType) {


    const otp = crypto.randomInt(10 ** (4 - 1), 10 ** 4).toString();


    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: `${process.env.NODEMAILER_EMAIL}`,
            pass: `${process.env.NODEMAILER_PASS}`,
        },
    });

   
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"MatchMate 👻" <ahanaf.tanvir40@gmail.com>', // sender address
        to: `${email}`, // list of receivers
        subject: "MatchMate OTP", // Subject line
        html: `<b>Your ${emailType} OTP for MatchMate is ${otp}</b>`, // html
    });

    //remove console.log after testing
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    return ({ success: true, otp: otp });
}




