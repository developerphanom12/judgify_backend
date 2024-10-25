import express from "express"
import { AssignJuryCreate, awardCreate, Awardsget, awardUpdate, CreateGeneralSettings, CriteriaSettingCreate, dashboardEvents, deleteAward, deleteCriteria, EventArchive, eventCreate, EventLive, eventUpdate, eventupdateSocial, exportCsv, juryGroupCreate, loginseller, MyEventget, MyEventsget, NewPassword, ScorecardCreate, SearchEvent, sendOTP, SortBynewest, SortByOldest, SubmissionFormatCreate, updateforgetPassword, updateProfile, usercreate, verifyOTPHandler, visiblePublicly } from '../controller/adminController.js'
import { validateAdmin, validateAdminLogin, validateotp, validateEventCreate, validateAwardCreate, validateNewPass, validateVerifyOtp, validateAdminUpdateProfile, validateupdateForgetPassword, validateAwardCategoryUpdate, validateUpdateEventCreate, validateUpdateEventSocial, ValidateSubmissionIDformat, ValidateAwardDirectory, ValidategeneralSettings, ValidateEventLive, ValidateEventArchive, ValidateScoreCardCriteria, ValidateJuryGroupCreate, ValidateAssignJuryCreate } from '../validation/AdminValidation.js'
import authenticate from '../middleware/authentication.js'
import upload from '../middleware/multer.js'

const router = express.Router()

router.post('/register', validateAdmin, usercreate)

router.post('/login', validateAdminLogin, loginseller)

router.post('/profileUpdate', authenticate, upload.single('profile_image'), validateAdminUpdateProfile, updateProfile)

router.post('/send_otp', validateotp, sendOTP)

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler)

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)

router.post('/createEvent', authenticate, upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), validateEventCreate, eventCreate) //cut  

router.post('/awardCategory', authenticate, validateAwardCreate, awardCreate)

router.get('/allAwrads', authenticate, Awardsget)

router.get('/download', authenticate, exportCsv)

router.get('/dashboardEvents', authenticate, dashboardEvents)

router.post('/newPassword', authenticate, validateNewPass, NewPassword)

router.get('/MyEvents', authenticate, MyEventsget)

router.get('/OldAward', authenticate, SortByOldest)

router.get('/NewAward', authenticate, SortBynewest)

router.get('/SearchEvent', SearchEvent)

router.post('/updateAwardCategory', authenticate, validateAwardCategoryUpdate, awardUpdate)

router.delete('/awards/:id', authenticate, deleteAward)

router.post('/updateCreateEvent', authenticate, validateUpdateEventCreate, eventUpdate)

router.get('/getEvent/:event_id', authenticate, MyEventget) ///////////////////

router.post('/updateEventSocial', authenticate, upload.fields([{ name: 'event_logo' }, { name: 'event_banner' }, { name: 'social_image' }]), validateUpdateEventSocial, eventupdateSocial)

router.post('/submissionIDformat', authenticate, ValidateSubmissionIDformat, SubmissionFormatCreate)

router.post('/awardDirectory', authenticate, ValidateAwardDirectory, visiblePublicly)

router.post('/generalSettings', authenticate, ValidategeneralSettings, CreateGeneralSettings)

router.post('/toLive', authenticate, ValidateEventLive, EventLive)

router.post('/toArchive', authenticate, ValidateEventArchive, EventArchive)

router.post('/scorecardCreate', authenticate, ValidateScoreCardCriteria, ScorecardCreate)

router.post('/criteriaSettingCreate', authenticate, CriteriaSettingCreate)

router.delete('/deleteCriteria/:id', authenticate, deleteCriteria);

router.post('/juryGroupCreate', authenticate, ValidateJuryGroupCreate, juryGroupCreate)

router.post('/assignJury', authenticate, ValidateAssignJuryCreate, AssignJuryCreate)

export default router  