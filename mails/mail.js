import dotenv from 'dotenv'
import nodemailer from 'nodemailer';
dotenv.config();

async function sendGmail( first_name,last_name,email,company,mobile_number,country) {
    try {
        const user = process.env.EMAIL_USER;
        const pass = process.env.PASSWORD;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user,
                pass,
            },
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>"User Registration  Email Verification"</title>
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
                    }
                    .message {
                        margin-bottom: 15px;
                    }
                    .credentials {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <p class="message">Hello,</p>
                    <p class="credentials"><strong>First Name:</strong> ${first_name}</p>
                    <p class="credentials"><strong>Last Name:</strong> ${last_name}</p>
                    <p class="credentials"><strong>Email:</strong> ${email}</p>
                    <p class="credentials"><strong>Comapny:</strong> ${company}</p>
                    <p class="credentials"><strong>Mobile Number:</strong> ${mobile_number}</p>
                    <p class="credentials"><strong>Country:</strong> ${country}</p>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: user,
            to: email,
            subject: "User Registration  Email Verification",
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default  sendGmail ;
