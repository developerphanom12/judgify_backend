import express from "express"
import { AdminProfileget, AssignJuryCreate, AwardByIdget, awardCreate, Awardsget, awardUpdate, CreateCoupon, CreateGeneralSettings, CriteriaSettingCreate, CriteriaSettingUpdate, dashboardEvents, deleteAward, deleteGroupCriteria, deleteJuryGroup, deleteScoreCard, EventArchive, eventCreate, EventLive, eventUpdate, eventupdateSocial, exportCsv,  juryGroupCreate, JuryGroupGet, juryGroupUpdate, JuryNameget, loginseller, MyEventget, MyEventsget, NewPassword, ScorecardCreate, Scorecardget, ScorecardUpdate, sendOTP, SubmissionFormatCreate, updateforgetPassword, updateProfile, usercreate, verifyOTPHandler, visiblePublicly } from '../controller/adminController.js'
import { validateAdmin, validateAdminLogin, validateotp, validateAwardCreate, validateNewPass, validateVerifyOtp, validateupdateForgetPassword, validateAwardCategoryUpdate, validateUpdateEventCreate, validateUpdateEventSocial, ValidateSubmissionIDformat, ValidateAwardDirectory, ValidategeneralSettings, ValidateEventLive, ValidateEventArchive, ValidateScoreCardCriteria, ValidateJuryGroupCreate, ValidateAssignJuryCreate, ValidateScoreCardUpdate, ValidateCriteriaSettingsCreate, ValidateCriteriaSettingUpdate, ValidateJuryGroupUpdate, ValidateCouponCreate, validatefilterCategory } from '../validation/AdminValidation.js'
import authenticate from '../middleware/authentication.js'
import upload from '../middleware/multer.js'

const router = express.Router()

//------------------------------------------ admin login ----------------------------------------------//

router.post('/register', validateAdmin, usercreate)//* --------  DONE

router.post('/login', validateAdminLogin, loginseller)//* --------  DONE

router.post('/profileUpdate', authenticate, upload.single('profile_image'), updateProfile)//* --------  DONE

router.post('/send_otp', validateotp, sendOTP)//* --------  DONE

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler)//* --------  DONE

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)//* --------  DONE

//------------------------------------------ profile Update ----------------------------------------------//

router.get('/getprofile', authenticate, AdminProfileget)//* --------  DONE

router.get('/allAwards', authenticate,validatefilterCategory, Awardsget)//* --------  DONE

router.post('/newPassword', authenticate, validateNewPass, NewPassword)//* --------  DONE

//----------------------------------------- dashboard events ----------------------------------------------//

router.get('/dashboardEvents', authenticate, dashboardEvents)//* --------  DONE

router.get('/MyEvents', authenticate, MyEventsget)//* --------  DONE

//----------------------------------------- Create Event ----------------------------------------------//

router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), eventCreate)//* --------  DONE

router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate)//* --------  DONE

router.get('/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE 

router.get('/download', authenticate, exportCsv)//* --------  DONE

router.post('/updateAwardCategory', authenticate, validateAwardCategoryUpdate, awardUpdate)//* --------  DONE 

router.delete('/awards/:id', authenticate, deleteAward)//* --------  DONE

router.get('/awardget/:awardId', authenticate, AwardByIdget)//* --------  DONE 

//----------------------------------------- Update Event ----------------------------------------------//

router.get('/getEvent/:event_id', authenticate, MyEventget)//^-------------Second modal 

router.post('/updateCreateEvent', authenticate, validateUpdateEventCreate, eventUpdate)//^-------------Second modal 

router.post('/updateEventSocial', authenticate, upload.fields([{ name: 'event_logo' }, { name: 'event_banner' }, { name: 'social_image' }]), validateUpdateEventSocial, eventupdateSocial)//^-------------Second modal 

router.post('/submissionIDformat', authenticate, ValidateSubmissionIDformat, SubmissionFormatCreate)//^-------------Second modal 

router.post('/awardDirectory', authenticate, ValidateAwardDirectory, visiblePublicly)//^-------------Second modal 

router.post('/couponCreate', authenticate, ValidateCouponCreate, CreateCoupon)//^-------------Second modal 

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