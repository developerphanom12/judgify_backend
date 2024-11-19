import express from "express"
import { AdminProfileget, AssignJuryCreate, awardCreate, Awardsget, awardUpdate, CreateCoupon, CreateGeneralSettings, CriteriaSettingCreate, CriteriaSettingUpdate, dashboardEvents, deleteAward, deleteGroupCriteria, deleteJuryGroup, deleteScoreCard, EventArchive, eventCreate, EventLive, eventUpdate, eventupdateSocial, exportCsv, GetEmailForVerify, juryGroupCreate, JuryGroupGet, juryGroupUpdate, JuryNameget, loginseller, MyEventget, MyEventsget, NewPassword, ScorecardCreate, Scorecardget, ScorecardUpdate, SearchEvent, sendOTP, SortBynewest, SortByOldest, SubmissionFormatCreate, updateforgetPassword, updateProfile, usercreate, verifyOTPHandler, visiblePublicly } from '../controller/adminController.js'
import { validateAdmin, validateAdminLogin, validateotp, validateEventCreate, validateAwardCreate, validateNewPass, validateVerifyOtp, validateupdateForgetPassword, validateAwardCategoryUpdate, validateUpdateEventCreate, validateUpdateEventSocial, ValidateSubmissionIDformat, ValidateAwardDirectory, ValidategeneralSettings, ValidateEventLive, ValidateEventArchive, ValidateScoreCardCriteria, ValidateJuryGroupCreate, ValidateAssignJuryCreate, ValidateScoreCardUpdate, ValidateCriteriaSettingsCreate, ValidateCriteriaSettingUpdate, ValidateJuryGroupUpdate, ValidateCouponCreate, validatefilterCategory } from '../validation/AdminValidation.js'
import authenticate from '../middleware/authentication.js'
import upload from '../middleware/multer.js'

const router = express.Router()

router.post('/register', validateAdmin, usercreate)//* --------  DONE

router.post('/login', validateAdminLogin, loginseller)//* --------  DONE

router.post('/profileUpdate', authenticate, upload.single('profile_image'), updateProfile)//!-----------   to be done today 

router.post('/send_otp', validateotp, sendOTP)//* --------  DONE

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler)//* --------  DONE

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)//* --------  DONE

router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), eventCreate) //cut  //!----changes will be apllied here by Avneet sir 

router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate)//* --------  DONE

router.get('/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE

router.get('/download', authenticate, exportCsv)//!-----------  to be done today

router.get('/dashboardEvents', authenticate, dashboardEvents)//* --------  DONE

router.post('/newPassword', authenticate, validateNewPass, NewPassword)//!-----------  to be done today

router.get('/MyEvents', authenticate, MyEventsget)//* --------  DONE

router.get('/OldAward', authenticate, SortByOldest)

router.get('/NewAward', authenticate, SortBynewest)

router.get('/SearchEvent', SearchEvent)

router.post('/updateAwardCategory', authenticate, validateAwardCategoryUpdate, awardUpdate)

router.delete('/awards/:id', authenticate, deleteAward)

router.post('/updateCreateEvent', authenticate, eventUpdate)

router.get('/getEvent/:event_id', authenticate, MyEventget) //!-----------  to be done today

router.post('/updateEventSocial', authenticate, upload.fields([{ name: 'event_logo' }, { name: 'event_banner' }, { name: 'social_image' }]), validateUpdateEventSocial, eventupdateSocial)

router.post('/submissionIDformat', authenticate, ValidateSubmissionIDformat, SubmissionFormatCreate)

router.post('/awardDirectory', authenticate, ValidateAwardDirectory, visiblePublicly)

router.post('/generalSettings', authenticate, ValidategeneralSettings, CreateGeneralSettings)

router.post('/toLive', authenticate, ValidateEventLive, EventLive)

router.post('/toArchive', authenticate, ValidateEventArchive, EventArchive)

router.post('/scorecardCreate', authenticate, ValidateScoreCardCriteria, ScorecardCreate)

router.post('/criteriaSettingCreate', authenticate, ValidateCriteriaSettingsCreate, CriteriaSettingCreate)

router.delete('/deleteScoreCard/:id', authenticate, deleteScoreCard)

router.post('/juryGroupCreate', authenticate, ValidateJuryGroupCreate, juryGroupCreate)

router.post('/assignJury', authenticate, ValidateAssignJuryCreate, AssignJuryCreate)

router.get('/getScorecard', authenticate, Scorecardget)

router.post('/scoreCardUpdate', authenticate, ValidateScoreCardUpdate, ScorecardUpdate)

router.post('/settingsUpdate', authenticate, ValidateCriteriaSettingUpdate, CriteriaSettingUpdate)

router.post('/juryGroupUpdate', authenticate, ValidateJuryGroupUpdate, juryGroupUpdate)

router.delete('/deleteJuryGroup/:id', authenticate, deleteJuryGroup)

router.get('/getJuryGroups', authenticate, JuryGroupGet)

router.delete('/JuryCriteriaDelete/:id', authenticate, deleteGroupCriteria)

router.get('/getJuryName', authenticate, JuryNameget)

router.get('/getEmail/:otpId', GetEmailForVerify)

router.get('/getprofile', authenticate, AdminProfileget)//* --------  DONE

router.post('/couponCreate', authenticate, ValidateCouponCreate, CreateCoupon)


export default router   