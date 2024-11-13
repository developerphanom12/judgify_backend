import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

async function sendGmailotp(email, otp) {
    try {
        // Ensure the environment variables exist
        const user = process.env.EMAIL_USER;
        const pass = process.env.PASSWORD;
        
 
        // Create a transporter for Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // You can also use 'smtp.gmail.com' for custom configurations
            auth: {
                user,        // Email address
                pass,        // App-specific password (if 2FA enabled)
            },
        });

        // Define the HTML content for the email
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP for Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #fff;
                        border: 1px solid #ccc;
                        border-radius: 10px;
                        text-align: center;
                    }
                    .otp {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        background-color: #f7f7f7;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Your OTP Code</h2>
                    <p>Please use the following One-Time Password (OTP) to complete your verification:</p>
                    <div class="otp">${otp}</div>
                    <p class="footer">If you did not request this OTP, please ignore this email.</p>
                </div>
            </body>
            </html>
        `;

        // Configure email options
        const mailOptions = {
            from: user,
            to: email,
            subject: "Your OTP Code for Verification",
            html: htmlContent,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        // Improved error handling with more details
        console.error('Error sending email:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check your email credentials.');
        }
    }
}

export default sendGmailotp;
