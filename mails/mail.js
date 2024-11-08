import dotenv from 'dotenv'
import nodemailer from 'nodemailer';
dotenv.config();

async function sendGmailAssign(first_name, last_name, email, group_name) {
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
                <title>User Assignment Notification</title>
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
                    <p class="message">Hello ${first_name} ${last_name},</p>
                    <p class="message">You have been assigned as jury to the <strong>Group: ${group_name}</strong>.</p>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: user,
            to: email,
            subject: "you are Assigned as jury ",
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default sendGmailAssign;
