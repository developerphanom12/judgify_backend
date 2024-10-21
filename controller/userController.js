const saltRounds = 10;
import bcrypt from "bcrypt";
import resposne from "../middleware/resposne.js";
import { changePassword, checkemail, checkemailOtp, checkphone, generateOTP, loginUser, storeOTP, userRegister, verifyOTP } from "../service/userService.js";
import sendGmail from "../mails/mail.js";

export const usercreate = async (req, res) => {
    const { first_name, last_name, email, password, company, mobile_number, country } = req.body;
    const emailcheck = await checkemail(email);
    if (emailcheck) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.checkEmail,
        });
    }

    const phone = await checkphone(mobile_number);
    if (phone) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.checkphone,
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userid = await userRegister(
            first_name, last_name, email, hashedPassword, company, mobile_number, country
        );

        try {
            const emailResult = await sendGmail(first_name, last_name, email, company, mobile_number, country);
            return res.status(200).json({
                status: true,
                message: resposne.usercreate,
                data: userid,
                emailMessage: emailResult
            });
        } catch (emailError) {
            console.error('Email Error:', emailError.message);
            return res.status(200).json({
                status: true,
                message: resposne.usercreateEmailFail,
                data: userid,
                emailError: emailError.message
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};

export const loginuser = async (req, res) => {
    const { email, password } = req.body;
    const emailExists = await checkemail(email);

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist
        });
    }
    try {

        const loginResult = await loginUser(
            email,
            password
        );

        if (loginResult.length > 0) {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.userlginsuccess,
                data: loginResult.data,
            });

        } else {

            return res.status(400).json({
                status: resposne.successFalse,
                message: loginResult.error,
            });
        }
    }
    catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};

export const sendOTP = async (req, res) => {
    const { email } = req.body;
    const emailExists = await checkemail(email);

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist
        });
    }
    try {

        const otp = generateOTP();

        const storedotp = await storeOTP(email, otp);
        if (storedotp.length > 0) {
            res.status(200).json({
                status: resposne.successTrue,
                message: resposne.otpsend,
            });
        } else {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.otpstorefailed,
            });
        }
    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};

export const verifyOTPHandler = async (req, res) => {
    const { email, otp } = req.body;
    const emailExists = await checkemail(email);

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.emailnotexist,
        });
    }
    try {
        const verifiedotp = await verifyOTP(email, otp);

        if (verifiedotp.length > 0) {
            res.status(200).json({
                status: resposne.successTrue,
                message: resposne.otpverified,
            });
        }
        res.status(400).json({
            status: resposne.successFalse,
            message: resposne.otpverifyfailed,
        });
    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};

export const updatePassword = async (req, res) => {

    const { email, password } = req.body;
    const emailExists = await checkemailOtp(email);

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.otpnotverified,
        });
    }
    try {


        const result = await changePassword({ email, password });

        if (result.length > 0) {
            res.status(200).json({
                status: resposne.successTrue,
                message: result,
            });
        } else {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.errorchangePass,
            });

        }
    } catch (error) {
        res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        });
    }
};

// const role = req.user.role;

// if (role !== "user") {
//     return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.unauth,
//     });
// }