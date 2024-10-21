const saltRounds = 10;
import bcrypt from "bcrypt";
import { adminRegister, changeforgetPassword,  checkemail, checkemailOtp, checkeventId, checkphone, createAward, createEvent, exportToExcel,  getAwards, getEventDashboard, getMyEvents, loginAdmin, searchEvent, sortbynewest, sortbyoldest, storeOTP, updateprofile, verifyOTP , newPasswordd, checkCurrentPass, updateAward, softDeleteAward, checkifDeleted} from "../service/adminService.js";
import resposne from "../middleware/resposne.js";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
import otpGenerator from "otp-generator";


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

    const userid = await adminRegister(
      first_name, last_name, email, hashedPassword, company, mobile_number, country
    );

    if (userid.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.adminfailed,
      });
    }else{
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.admincreate,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const loginseller = async (req, res) => {
  const { email, password } = req.body;
  const emailExists = await checkemail(email);

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist
    });
  }
  try {

    const loginResult = await loginAdmin(
      email,
      password
    );

    if (loginResult===0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: loginResult.error,
      });
    }else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.adminlginsuccess,
        data: loginResult.data,
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

export const updateProfile = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const userId = req.user.id;
  const { first_name, last_name, email, company, mobile_number, time_zone, job_title } = req.body;
  const profile_image = req.file;
  if (!profile_image) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.imageRequire,
    });
  }
  try {


    const updates = {};

    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;
    if (company) updates.company = company;
    if (mobile_number) updates.mobile_number = mobile_number;
    if (time_zone) updates.time_zone = time_zone;
    if (job_title) updates.job_title = job_title;
    if (profile_image) updates.imageFilename = profile_image.filename;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noupdate,
      });
    }

    const result = await updateprofile(updates, userId);
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.updateFail,
      });
     
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.updateSuccess,
      });
    }
  } catch (error) {
    res.status(400).json({
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

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    })
    const storedotp = await storeOTP(email, otp);
    if (storedotp.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpstorefailed,
      });
    }else{
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.otpsend,
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

    if (verifiedotp.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpverifyfailed,
      });
    }else{
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.otpverified,
      });
    }
   
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateforgetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  const emailExists = await checkemailOtp(email);
  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.otpnotverified,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.newPass,
    });
  }

  try {
    const result = await changeforgetPassword({ email, newPassword });
    
    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorchangePass,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: "Password updated successfully",
      });
    }
   
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};


export const eventCreate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const {
    event_name,
    industry_type,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    additional_email,
    is_endorsement,
    is_withdrawal,
    is_edit_entry,
    limit_submission,
    submission_limit,
    event_description,
  } = req.body;


  if (email === additional_email) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.diffrentemail,
    });
  }
  if (limit_submission === 1 && (submission_limit === undefined || submission_limit < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.submisionlimit,
    });
  }
  try {

    const logo = req.files["event_logo"] ? req.files["event_logo"][0].filename : null;
    const banner = req.files["event_banner"] ? req.files["event_banner"][0].filename : null;

    if (!logo || !banner) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.logobanner,
      });
    }

    const result = await createEvent(
      event_name,
      industry_type,
      closing_date,
      closing_time,
      email,
      event_url,
      time_zone,
      additional_email,
      is_endorsement,
      is_withdrawal,
      is_edit_entry,
      limit_submission,
      submission_limit,
      logo,
      banner,
      event_description
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.createventfail,
      });
      
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.createvent,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const awardCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(403).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    category_name,
    category_prefix,
    belongs_group,
    limit_submission,
    is_start_date,
    is_end_date,
    is_endorsement,
    start_date,
    end_date
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  if (is_start_date === 1 && (!start_date  || start_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_start_REquired,
    });
  }

  if (is_end_date === 1 && (!end_date || end_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_end_REquired,
    });
  }

  try {
    const result = await createAward(
      eventId,
      category_name,
      category_prefix,
      belongs_group,
      limit_submission,
      is_start_date,
      is_end_date,
      is_endorsement,
      start_date,
      end_date
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.awardcreatefail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.awardcreate,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};


export const Awardsget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getAwards();
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.resolve(__dirname, '../files');

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}

export const exportCsv = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  try {
    const sheet = await exportToExcel();

    const filePath = path.join(directoryPath, 'Awards Category.xlsx');

    fs.writeFileSync(filePath, sheet);

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.downloadSuccess,
      path: filePath
    })
  } catch (error) {
    res.status(400).send({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const dashboardEvents = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getEventDashboard();
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const NewPassword = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(403).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const userId = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const passwordExists = await checkCurrentPass(currentPassword);
  if (!passwordExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkCurrentPass,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.newPass,
    });
  }

  try {
    const result = await newPasswordd({ userId, currentPassword, newPassword });

    res.status(200).json({
      status: resposne.successTrue,
      message: result,
    });
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const MyEventsget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { skip, limit } = req.query

  try {
    const parsedSkip = parseInt(skip, 8) || 0;
    const parsedLimit = parseInt(limit, 8) || 8;
    const result = await getMyEvents(parsedSkip,
      parsedLimit);
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const SortByOldest = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  try {
    const result = await sortbyoldest();
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const SortBynewest = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  try {
    const result = await sortbynewest();
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const SearchEvent = async (req, res) => {
  try {
    const { search } = req.query;
    const result = await searchEvent(search);
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const awardUpdate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(403).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }


  const {
    awardId,
    category_name,
    category_prefix,
    belongs_group,
    limit_submission,
    is_start_date,
    is_end_date,
    is_endorsement,
    start_date,
    end_date
  } = req.body;

  if (is_start_date === 1 && (!start_date || start_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_start_REquired,
    });
  }

  if (is_end_date === 1 && (!end_date || end_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_end_REquired,
    });
  }

  try {
    const result = await updateAward(
      awardId,
      category_name,
      category_prefix,
      belongs_group,
      limit_submission,
      is_start_date,
      is_end_date,
      is_endorsement,
      start_date,
      end_date
    );

    if (result.message) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.awardUpdateSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.awardUpdateFail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const deleteAward = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
 
  const awardId = req.params.id;
  const isDeleted = await checkifDeleted(awardId);
  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.awardalreadyDeleted,
    });
  }
  try {
    const message = await softDeleteAward(awardId);
    return res.status(200).json({
      status: resposne.successTrue,
      message:resposne.awardDeleted,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};


// {
//   "email":"midcap@yahoo.com",
//   "password":"moderated123"
// }
// {
//   "email": "avineyt@gmail.com",
//   "password": "test1111"
// }

// {
//   "eventId": "7",
//   "category_name": "Awards",
//   "category_prefix": "AW",
//   "belongs_group": "belongs to group Awards",
//   "limit_submission":"3",
//   "is_start_date":1,
//   "is_end_date":"0",
//   "is_endorsement":"1",
//   "start_date":"2024-12-15"
// }