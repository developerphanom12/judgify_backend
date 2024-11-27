import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';  // To generate a unique token for verification
dotenv.config();

async function sendGmailAssign(first_name, last_name, email, company, mobile_number, country, userId, verificationToken) {
    // Check if environment variables are set
    const user = process.env.EMAIL_USER;
    const pass = process.env.PASSWORD;
    const frontendUrl = process.env.FRONTEND_URL;  // The base URL of your frontend

    if (!user || !pass || !frontendUrl) {
        console.error('Email credentials or frontend URL are missing. Please check your .env file.');
        return;
    }

    try {
        // Construct the verification URL
        const verificationLink = `${frontendUrl}/verify?token=${verificationToken}&userId=${userId}`;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user,
                pass,
            },
        });

        // Email HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>User Registration Confirmation</title>
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
                    .verify-link {
                        color: #1e90ff;
                        text-decoration: none;
                    }
                    .footer {
                        font-size: 12px;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <p class="message">Hello ${first_name} ${last_name},</p>
                    <p class="message">You have successfully been registered.</p>
                    <p class="message">Company: ${company}</p>
                    <p class="message">Mobile: ${mobile_number}</p>
                    <p class="message">Country: ${country}</p>
                    <p class="message">Please click the following link to verify your email address and complete your registration:</p>
                    <p class="message">
                        <a href="${verificationLink}" class="verify-link">Verify Your Account</a>
                    </p>
                    <p class="footer">Thank you for your participation. If you have any questions, feel free to contact us.</p>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: user,
            to: email,
            subject: "You are Assigned as Jury",
            html: htmlContent,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default sendGmailAssign;
