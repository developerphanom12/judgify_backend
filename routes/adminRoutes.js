import express from "express"
import { AdminProfileget, AssignJuryCreate, awardCreate, Awardsget, awardUpdate, CreateCoupon, CreateGeneralSettings, CriteriaSettingCreate, CriteriaSettingUpdate, dashboardEvents, deleteAward, deleteGroupCriteria, deleteJuryGroup, deleteScoreCard, EventArchive, eventCreate, EventLive, eventUpdate, eventupdateSocial, exportCsv, GetEmailForVerify, juryGroupCreate, JuryGroupGet, juryGroupUpdate, JuryNameget, loginseller, MyEventget, MyEventsget, NewPassword, ScorecardCreate, Scorecardget, ScorecardUpdate, sendOTP, SubmissionFormatCreate, updateforgetPassword, updateProfile, usercreate, verifyOTPHandler, visiblePublicly } from '../controller/adminController.js'
import { validateAdmin, validateAdminLogin, validateotp, validateAwardCreate, validateNewPass, validateVerifyOtp, validateupdateForgetPassword, validateAwardCategoryUpdate,  ValidateSubmissionIDformat, ValidateAwardDirectory, ValidategeneralSettings, ValidateEventLive, ValidateEventArchive, ValidateScoreCardCriteria, ValidateJuryGroupCreate, ValidateAssignJuryCreate, ValidateScoreCardUpdate, ValidateCriteriaSettingsCreate, ValidateCriteriaSettingUpdate, ValidateJuryGroupUpdate, ValidateCouponCreate, validatefilterCategory } from '../validation/AdminValidation.js'
import authenticate from '../middleware/authentication.js'
import upload from '../middleware/multer.js'

const router = express.Router()

//------------------------------------------ admin login ----------------------------------------------//

router.post('/register', validateAdmin, usercreate)//* --------  DONE

router.post('/login', validateAdminLogin, loginseller)//* --------  DONE

router.post('/send_otp', validateotp, sendOTP)//* --------  DONE

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler)//* --------  DONE

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)//* --------  DONE

router.get('/getEmail/:otpId', GetEmailForVerify)//~ -----delete this not used 

//------------------------------------------ profile Update ----------------------------------------------//

router.get('/getprofile', authenticate, AdminProfileget)//* --------  DONE

router.post('/profileUpdate', authenticate, upload.single('profile_image'), updateProfile)//!----------- to be done today 

router.post('/newPassword', authenticate, validateNewPass, NewPassword)//!-----------  to be done today

//----------------------------------------- dashboard events ----------------------------------------------//

router.get('/dashboardEvents', authenticate, dashboardEvents)//* --------  DONE

router.get('/MyEvents', authenticate, MyEventsget)//* --------  DONE

//----------------------------------------- Create Event ----------------------------------------------//

router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), eventCreate)//* --------  DONE

router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate)//* --------  DONE

router.get('/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE 

router.get('/download', authenticate, exportCsv)//!-----------  to be done today

router.post('/updateAwardCategory', authenticate, validateAwardCategoryUpdate, awardUpdate)//!-----------  to be done 

router.delete('/awards/:id', authenticate, deleteAward)//!-----------  to be done 

//----------------------------------------- Update Event ----------------------------------------------//

router.get('/getEvent/:event_id', authenticate, MyEventget)//^-------------Second modal //also get all the data as event images and description too

router.post('/updateCreateEvent', authenticate, eventUpdate)//^-------------Second modal 

router.post('/updateEventSocial', authenticate, upload.fields([{ name: 'event_logo' }, { name: 'event_banner' }, { name: 'social_image' }]), eventupdateSocial)

router.post('/submissionIDformat', authenticate, ValidateSubmissionIDformat, SubmissionFormatCreate)

router.post('/awardDirectory', authenticate, ValidateAwardDirectory, visiblePublicly)

router.post('/couponCreate', authenticate, ValidateCouponCreate, CreateCoupon)

//----------------------------------------- Manage Jury ----------------------------------------------//

router.post('/generalSettings', authenticate, ValidategeneralSettings, CreateGeneralSettings)



//----------------------------------------- draft to live or archive ----------------------------------------------//

router.post('/toLive', authenticate, ValidateEventLive, EventLive)

router.post('/toArchive', authenticate, ValidateEventArchive, EventArchive)

//----------------------------------------- ScoreCard Create ----------------------------------------------//

router.post('/scorecardCreate', authenticate, ValidateScoreCardCriteria, ScorecardCreate)

router.post('/criteriaSettingCreate', authenticate, ValidateCriteriaSettingsCreate, CriteriaSettingCreate)

router.post('/settingsUpdate', authenticate, ValidateCriteriaSettingUpdate, CriteriaSettingUpdate)

router.get('/getScorecard', authenticate, Scorecardget)

router.post('/scoreCardUpdate', authenticate, ValidateScoreCardUpdate, ScorecardUpdate)

router.delete('/deleteScoreCard/:id', authenticate, deleteScoreCard)


//----------------------------------------- Jury group Create ----------------------------------------------//

router.post('/assignJury', authenticate, ValidateAssignJuryCreate, AssignJuryCreate)

router.get('/getJuryName', authenticate, JuryNameget)

router.post('/juryGroupCreate', authenticate, ValidateJuryGroupCreate, juryGroupCreate)

router.post('/juryGroupUpdate', authenticate, ValidateJuryGroupUpdate, juryGroupUpdate)

router.delete('/deleteJuryGroup/:id', authenticate, deleteJuryGroup)

router.get('/getJuryGroups', authenticate, JuryGroupGet)

router.delete('/JuryCriteriaDelete/:id', authenticate, deleteGroupCriteria)

export default router   