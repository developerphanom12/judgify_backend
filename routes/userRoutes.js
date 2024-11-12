import express from "express";
import { CouponCodesget, loginuser, sendOTP, updatePassword, usercreate, verifyOTPHandler } from "../controller/userController.js";
import { validateotp, validateUser, validateUserLogin, validateVerifyOtp } from "../validation/UserValidation.js";
import authenticate from "../middleware/authentication.js";

const router = express.Router();

router.post('/register', validateUser, usercreate)

router.post('/login', validateUserLogin, loginuser)

router.post('/send_otp', validateotp, sendOTP);

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler);

router.post('/updatePassword', updatePassword)

router.get('/getCoupon/:id', authenticate, CouponCodesget)

export default router