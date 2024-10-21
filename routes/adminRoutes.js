import express from "express";
import { awardCreate, Awardsget, awardUpdate, dashboardEvents, deleteAward, eventCreate, exportCsv, loginseller, MyEventsget, NewPassword, SearchEvent, sendOTP, SortBynewest, SortByOldest, updateforgetPassword, updateProfile, usercreate, verifyOTPHandler } from '../controller/adminController.js';
import { validateAdmin, validateAdminLogin, validateotp, validateEventCreate, validateAwardCreate, validateNewPass, validateVerifyOtp, validateAdminUpdateProfile, validateupdateForgetPassword, validateAwardCategoryUpdate } from '../validation/AdminValidation.js'
import authenticate from '../middleware/authentication.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/register', validateAdmin, usercreate);

router.post('/login', validateAdminLogin, loginseller);

router.post("/profileUpdate", authenticate, upload.single('profile_image'), validateAdminUpdateProfile, updateProfile);

router.post('/send_otp', validateotp, sendOTP);

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler);

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)

router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), validateEventCreate, eventCreate) //cut

router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate);

router.get('/allAwrads', authenticate, Awardsget); 

router.get('/download', authenticate, exportCsv);

router.get('/dashboardEvents', authenticate, dashboardEvents);

router.post('/newPassword', authenticate, validateNewPass, NewPassword);  /////////////////////////////////////////////

router.get('/MyEvents', authenticate, MyEventsget);

router.get('/OldAward', authenticate, SortByOldest);

router.get('/NewAward', authenticate, SortBynewest);

router.get('/SearchEvent', SearchEvent);

router.post('/updateAwardCategory',authenticate, validateAwardCategoryUpdate,awardUpdate)

router.delete('/awards/:id',authenticate,deleteAward)

export default router;