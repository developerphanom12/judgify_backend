const dotenv = require('dotenv')
const nodemailer = require('nodemailer');
dotenv.config();

async function sendGmail(subject, message, email) {
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
                <title>${subject}</title>
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
                    <p class="message">${message}</p>
                    <p class="credentials"><strong>Email:</strong> ${email}</p>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: user,
            to: email,
            subject: "Today's Notes are Uploded",
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { sendGmail };
