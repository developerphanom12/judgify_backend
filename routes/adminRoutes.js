import express from "express"
import { AdminProfileget, AssignJuryCreate, AwardByIdget, awardCreate, Awardsget, awardUpdate, CreateCoupon, createEntryForm, CreateGeneralSettings, createRegistrationForm, CriteriaSettingCreate, CriteriaSettingUpdate, dashboardEvents, deleteAward, deleteGroupCriteria, deleteJuryGroup, deleteScoreCard, EventArchive, eventCreate, EventLive, eventUpdate, eventupdateSocial, exportCsv,  getEntryFormByEventId,  getRegistrationFormByEventId,  juryGroupCreate, JuryGroupGet, juryGroupUpdate, JuryNameget, loginseller, MyEventget, MyEventsget, NewPassword, ScorecardCreate, Scorecardget, ScorecardUpdate, sendOTP, SubmissionFormatCreate, updateEntryForm, updateforgetPassword, updateProfile, updateRegistrationForm, usercreate, verifyOTPHandler, visiblePublicly } from '../controller/adminController.js'
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


//----------------------------------------- dynamic forms ----------------------------------------------//

// Registration Form Routes
router.post('/registrationForm', createRegistrationForm);
router.get('/registrationForm/:eventId', getRegistrationFormByEventId);
router.put('/registrationForm/:eventId', updateRegistrationForm);

// Entry Form Routes
router.post('/entryForm/', createEntryForm);
router.get('/entryForm/:eventId', getEntryFormByEventId);
router.put('/entryForm/:eventId', updateEntryForm);

//----------------------------------------- with the 5000 port  ----------------------------------------------//


router.post('/', (req, res) => {
    const { name, schema } = req.body;
    const sql = 'INSERT INTO forms (name, form_schema) VALUES (?, ?)';
    db.query(sql, [name, JSON.stringify(schema)], (err, result) => {
        if (err) return res.status(500).send('Server error');
        res.send({ id: result.insertId });
    });
});

// Fetch form by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).send('Form ID is required');
    const sql = 'SELECT * FROM forms WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send('Server error');
        if (result.length === 0) return res.status(404).send('Form not found');
        res.send(result[0]);
    });
});

// Update form by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, schema } = req.body;
    const sql = 'UPDATE forms SET name = ?, form_schema = ? WHERE id = ?';
    db.query(sql, [name, JSON.stringify(schema), id], (err, result) => {
        if (err) return res.status(500).send('Server error');
        if (result.affectedRows === 0) return res.status(404).send('Form not found');
        res.send({ message: 'Form updated successfully' });
    });
});

// Delete form by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).send('Form ID is required');
    const sql = 'DELETE FROM forms WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send('Server error');
        if (result.affectedRows === 0) return res.status(404).send('Form not found');
        res.send({ message: 'Form deleted successfully' });
    });
});

// Save Submission form
router.post('/Submission-form', (req, res) => {
    const { name, schema } = req.body;
    const sql = 'INSERT INTO submission_forms (name, form_schema) VALUES (?, ?)';
    db.query(sql, [name, JSON.stringify(schema)], (err, result) => {
        if (err) return res.status(500).send('Server error');
        res.send({ id: result.insertId });
    });
});

// Update Submission form by ID
router.put('/Submission-form/:id', (req, res) => {
    const { id } = req.params;
    const { name, schema } = req.body;
    const sql = 'UPDATE submission_forms SET name = ?, form_schema = ? WHERE id = ?';
    db.query(sql, [name, JSON.stringify(schema), id], (err, result) => {
        if (err) return res.status(500).send('Server error');
        if (result.affectedRows === 0) return res.status(404).send('Submission form not found');
        res.send({ message: 'Submission form updated successfully' });
    });
});


export default router