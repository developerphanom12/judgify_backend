import express from "express";
import { CouponCodesget, loginuser, sendOTP, updateforgetPassword, 
    // updatePassword,
     usercreate, verifyOTPHandler } from "../controller/userController.js";
import { validateotp, validateupdateForgetPassword, validateUser, validateUserLogin, validateVerifyOtp } from "../validation/UserValidation.js";
import authenticate from "../middleware/authentication.js";

const router = express.Router();

router.post('/register', validateUser, usercreate)

router.post('/login', validateUserLogin, loginuser)

router.post('/send_otp', validateotp, sendOTP);

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler);

// router.post('/updatePassword', updatePassword)

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)

router.get('/getCoupon/:id', authenticate, CouponCodesget)

export default router