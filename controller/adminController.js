const saltRounds = 10;
import bcrypt from "bcrypt";
import {
  adminRegister,
  changeforgetPassword,
  checkemail,
  checkemailOtp,
  checkeventId,
  checkphone,
  createAward,
  createEvent,
  exportToExcel,
  getAwards,
  getEventDashboard,
  getMyEvents,
  loginAdmin,
  storeOTP,
  updateprofile,
  verifyOTP,
  newPasswordd,
  checkCurrentPass,
  updateAward,
  softDeleteAward,
  checkifDeleted,
  industry_types,
  updateEventDetails,
  getEventById,
  updateEventSocial,
  addSubmissionId,
  publiclyVisible,
  generalSettings,
    CreateScorecardCriteria,
  overallScorecardValue,
  CreateCriteriaSettingValues,
  criteriaSettings,
  CreateJuryGroup,
  CreateFilteringCriteria,
  CreateFilteringCriteriaCategory,
  AssignJury,
  getScorecard,
  updateOverallScorecardValue,
  updateScorecardCriteria,
  updateCriteriaSettings,
  updateCriteriaSettingValues,
  UpdateFilteringCriteria,
  UpdateJuryGroup,
  UpdateFilteringCriteriaCategory,
  softDeleteJuryGroup,
  softDeleteFilteringCriteriaCategory,
  softDeleteFilteringCriteria,
  checkifDeletedGroupId,
  getJuryGroup,
  softDeleteGroupCriteria,
  softDeleteGroupCriteriaCategory,
  checkIfDeletedFilterId,
  checkIfDeletedCriteriaId,
  softDeleteCriteriaSettingValue,
  softDeleteCriteriaSetting,
  softDeleteCriteria,
  getJuryName,
  getAdminProfile,
  createCoupon,
  checkAdmin,
  checkeventEmail,
  additional_emailssss,
  getAwardById,
  checkAwardId,
  EmptyStartDate,
  EmptyEndDate,
  createRegistrationFormService,
  getRegistrationFormService,
  updateRegistrationFormService,
  createEntryFormService,
  getEntryFormService,
  updateEntryFormService,
  searchEvent,
  checkifAlreadyVisible,
  checkRegFormId,
  checkentryFormId,
  updateAdditionalEmails,
  statusEvent,
  updatedIndustryTypes,
} from "../service/adminService.js";
import resposne from "../middleware/resposne.js";
import path from "path";
import fs, { stat } from "fs";
import { fileURLToPath } from "url";
import otpGenerator from "otp-generator";
import sendGmailAssign from "../mails/mail.js";
import sendGmailotp from "../mails/sendOtp.js";
import ExcelJS from "exceljs";
import { updateIndustryTypes } from "../service/service.js";

export const usercreate = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    company,
    mobile_number,
    country,
  } = req.body;
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
      first_name,
      last_name,
      email,
      hashedPassword,
      company,
      mobile_number,
      country
    );

    if (userid.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.adminfailed,
      });
    } else {
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
      message: resposne.emailnotexist,
    });
  }
  try {
    const loginResult = await loginAdmin(email, password);
    // console.log("loginresult", loginResult)
    if (loginResult.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: loginResult.error,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.adminlginsuccess,
        data: loginResult.data,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const {
    first_name,
    last_name,
    email,
    company,
    mobile_number,
    time_zone,
    job_title,
  } = req.body;
  const profile_image = req.file;

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
      message: resposne.emailnotexist,
    });
  }

  try {
    const otp = otpGenerator.generate(6, {
      digits: esposne.successTrue,
      lowerCaseAlphabets: resposne.successFalse,
      upperCaseAlphabets: resposne.successFalse,
      specialChars: resposne.successFalse,
    });

    const storedotp = await storeOTP(email, otp);
    if (storedotp.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpstorefailed,
      });
    }
    const sendotpemail = await sendGmailotp(email, otp);

    if (sendotpemail) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Error while sending OTP to email.",
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.otpsend,
    });
  } catch (error) {
    return res.status(400).json({
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
    } else {
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
        message: resposne.passupdateSuccess,
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
  const adminId = req.user.id;
  const adminExists = await checkAdmin(adminId);
  if (!adminExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noadmin,
    });
  }
  const {
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_ediit_entry,
    limit_submission,
    submission_limit,
    event_description,
    industry_type,
    additional_email,
  } = req.body;

  const checkEmail = await checkeventEmail(email);
  if (checkEmail) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkEmail,
    });
  }
  try {
    if (
      limit_submission === 1 &&
      (submission_limit === undefined || submission_limit < 1)
    ) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submisionlimit,
      });
    }

    const logo = req.files["event_logo"]
      ? req.files["event_logo"][0].filename
      : null;
    const banner = req.files["event_banner"]
      ? req.files["event_banner"][0].filename
      : null;

    if (!logo && !banner) {
      console.warn("Both logo and banner are not provided.");
    }

    const eventResult = await createEvent(
      adminId,
      event_name,
      closing_date,
      closing_time,
      email,
      event_url,
      time_zone,
      is_endorsement,
      is_withdrawal,
      is_ediit_entry,
      limit_submission,
      submission_limit,
      logo,
      banner,
      event_description
    );
    const emailcreate = await additional_emailssss(
      eventResult.id,
      additional_email
    );
    if (emailcreate.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: error.message,
      });
    }

    const indstrycreate = await industry_types(eventResult.id, industry_type);
    if (indstrycreate.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: error.message,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.createvent,
      eventId: eventResult.id,
    });
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
    return res.status(400).json({
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
    end_date,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

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
        awardId: result.id,
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

  const { eventId, search, sortOrder } = req.query;
  const searchTerm = search && search.trim() !== "" ? search : null;
  const order = sortOrder === "oldest" ? "oldest" : "newest";

  try {
    const result = await getAwards(eventId, searchTerm, order);

    if (result.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.resolve(__dirname, "../files");

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}

// export const exportCsv = async (req, res) => {
//   const role = req.user.role
//   const eventId = req.query.eventId

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     })
//   }

//   try {
//     // console.log('Event ID:', eventId)
//     // console.log('Event ID:', eventId)

//     const sheet = await exportToExcel(eventId)

//     fs.writeFileSync(filePath, sheet)
//     const filePath = path.join(directoryPath, 'Awards Category.xlsx')

//     fs.writeFileSync(filePath, sheet)

//     return res.status(200).json({
//       status: resposne.successTrue,
//       message: resposne.downloadSuccess,
//       path: filePath,
//     })

//   } catch (error) {
//     // console.error('Error exporting to Excel:', error)
//     // console.error('Error exporting to Excel:', error)
//     res.status(400).send({
//       status: resposne.successFalse,
//       message: error.message,
//     })
//   }
// }

export const exportCsv = async (req, res) => {
  try {
    const eventId = req.query.eventId;

    if (!eventId) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      });
    }

    const products = await exportToExcel(eventId);

    if (!products || products.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "No product data available to export",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    worksheet.columns = [
      { header: "ID", key: "id", width: 5 },
      { header: "Event ID", key: "eventId", width: 12 },
      { header: "Category Name", key: "category_name", width: 20 },
      { header: "Category Prefix", key: "category_prefix", width: 15 },
      { header: "Belongs Group", key: "belongs_group", width: 35 },
      { header: "Limit Submission", key: "limit_submission", width: 35 },
      { header: "Closing Date", key: "closing_date", width: 25 },
    ];

    products.forEach((product) => {
      worksheet.addRow(product);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment filename=products.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: resposne.downloadFail,
      error: error.message,
    });
  }
};

export const dashboardEvents = async (req, res) => {
  const role = req.user.role;
  const id = req.user.id;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { skip, limit, sortOrder } = req.query;

  // console.log("Query Params:", req.query)

  const validSortOrders = ["newest", "oldest"];
  const order = validSortOrders.includes(sortOrder) ? sortOrder : "newest";

  try {
    const parsedSkip = parseInt(skip, 10) || 0;
    const parsedLimit = parseInt(limit, 100) || 100;

    const result = await getEventDashboard(parsedSkip, parsedLimit, id, order);

    if (result.length > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
  } catch (error) {
    // console.error("Error fetching dashboard events:", error)
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const NewPassword = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const search = req.query;
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const passwordExists = await checkCurrentPass(userId, currentPassword);
  if (passwordExists.error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkCurrentPass,
    });
  }

  try {
    const result = await newPasswordd({
      userId,
      search,
      currentPassword,
      newPassword,
    });
    if (result.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "error in create new password",
      });
    }
    res.status(200).json({
      status: resposne.successTrue,
      message: result,
    });
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
    // console.log("error", error.message)
  }
};

export const MyEventsget = async (req, res) => {
  const role = req.user.role;
  const id = req.user.id;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { skip, limit, order } = req.query;

  // console.log("Query Params:", req.query)

  const sortOrder = order === "newest" ? "oldest" : "newest";

  // console.log("Sort order:", sortOrder)

  try {
    const parsedSkip = parseInt(skip, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 8;

    const result = await getMyEvents(parsedSkip, parsedLimit, id, sortOrder);

    if (result.totalCount === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const awardUpdate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
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
    end_date,
  } = req.body;

  const updates = {};

  if (category_name) updates.category_name = category_name;
  if (category_prefix) updates.category_prefix = category_prefix;
  if (belongs_group) updates.belongs_group = belongs_group;
  if (limit_submission !== undefined)
    updates.limit_submission = limit_submission;
  if (is_start_date !== undefined) updates.is_start_date = is_start_date;
  if (is_end_date !== undefined) updates.is_end_date = is_end_date;
  if (is_endorsement !== undefined) updates.is_endorsement = is_endorsement;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noupdate,
    });
  }

  try {
    if (is_start_date === 0) {
      await EmptyStartDate(awardId);
    }

    if (is_end_date === 0) {
      await EmptyEndDate(awardId);
    }

    const result = await updateAward(awardId, updates);

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
    if (message.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.deleteAwardError,
      });
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.awardDeleted,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

const validateSubmissionLimit = (limit_submission, submission_limit) => {
  if (limit_submission && !submission_limit) {
    return resposne.submisionlimit;
  }
  return null;
};

const getUpdateFields = ({
  event_name,
  closing_date,
  closing_time,
  email,
  event_url,
  time_zone,
  is_endorsement,
  is_withdrawal,
  is_edit_entry,
  limit_submission,
  submission_limit,
}) => {
  const updates = {};
  if (event_name) updates.event_name = event_name;
  if (closing_date) updates.closing_date = closing_date;
  if (closing_time) updates.closing_time = closing_time;
  if (email) updates.email = email;
  if (event_url) updates.event_url = event_url;
  if (time_zone) updates.time_zone = time_zone;
  if (is_endorsement !== undefined) updates.is_endorsement = is_endorsement;
  if (is_withdrawal !== undefined) updates.is_withdrawal = is_withdrawal;
  if (is_edit_entry !== undefined) updates.is_edit_entry = is_edit_entry;
  if (limit_submission !== undefined) updates.limit_submission = limit_submission;
  if (submission_limit !== undefined) updates.submission_limit = submission_limit;
  return updates;
};

export const eventUpdate = async (req, res) => {
  const {
    eventId,
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_edit_entry,
    limit_submission,
    submission_limit,
    additional_email,
    industry_type,
  } = req.body;

  const updates = getUpdateFields({
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_edit_entry,
    limit_submission,
    submission_limit,
    eventId
  });

  if (Object.keys(updates).length === 0 &&
    !additional_email?.length &&
    !industry_type?.length) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.novalidfield
    });
  }

  try {
    const eventExists = await checkeventId(eventId);
    if (!eventExists) {
      return res.status(404).json({
        status: resposne.successFalse,
        message: resposne.eventnotfound
      });
    }

    const submissionLimitError = validateSubmissionLimit(limit_submission, submission_limit);
    if (submissionLimitError) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: submissionLimitError
      });
    }

    if (additional_email?.length) {
      const insertEmailResult = await updateAdditionalEmails(eventId, additional_email);
      // console.log("addd", insertEmailResult)
      if (insertEmailResult <= 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.insertORUpdateFail
        });
      }
    }

    if (industry_type?.length) {
      const insertIndustryResult = await updatedIndustryTypes(eventId, industry_type);
      if (insertIndustryResult <= 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.industrytypeInsertFail
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      const result = await updateEventDetails(updates, eventId);
      if (result.affectedRows > 0) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.updateventSuccess
        });
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: "Failed to update event"
        });
      }
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.updateventSuccess
      });
    }

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message
    });
  }
};

export const MyEventget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdRequired,
    });
  }

  try {
    const result = await getEventById(eventId);

    if (!result) {
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

export const eventupdateSocial = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const eventId = parseInt(req.body.eventId, 10);
  const event_description = req.body.event_description;
  const closing_messsage = req.body.closing_messsage;
  const jury_welcm_messsage = req.body.jury_welcm_messsage;
  const is_social = req.body.is_social
    ? parseInt(req.body.is_social, 10)
    : undefined;
  const social = req.body.social;

  const { event_logo, event_banner, social_image } = req.files || {};

  const updates = {
    event_description,
    closing_messsage,
    jury_welcm_messsage,
    is_social,
    social,
  };

  if (event_logo) updates.imageFilename = event_logo[0].filename;
  if (event_banner) updates.event_banner = event_banner[0].filename;
  if (social_image) updates.social_image = social_image[0].filename;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noupdate,
    });
  }

  try {
    const result = await updateEventSocial(updates, eventId);

    if (!result) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.updateFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.updateventSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const SubmissionFormatCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, submission_id } = req.body;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await addSubmissionId(eventId, submission_id);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submissionFormatFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.submissionFormatSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const visiblePublicly = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, is_publicly_visble } = req.body;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  if (is_publicly_visble === 1) {
    const isAlreadyVisible = await checkifAlreadyVisible(eventId);

    if (isAlreadyVisible) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.checkvisible, // Event is already publicly visible
      });
    }
  }
  try {
    const result = await publiclyVisible(eventId, is_publicly_visble);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.publicVisibleFalse,
      });
    }
    const successMessage =
      is_publicly_visble === 1
        ? resposne.publicVisibleTrue // Event made visible
        : resposne.visiblezero;

    return res.status(200).json({
      status: resposne.successTrue,
      message: successMessage,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const CreateGeneralSettings = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse, 
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    start_date,
    start_time,
    end_date,
    end_time,
    is_active = 0,  
    is_one_at_a_time = 0,
    is_individual_category_assigned = 0,
    is_Completed_Submission = 0,
    is_jury_print_send_all = 0,
    is_scoring_dropdown = 0,
    is_comments_box_judging = 0,
    is_data_single_page = 0,
    is_total = 0,
    is_jury_others_score = 0,
    is_abstain = 0,
    overall_score = 0,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const eventResult = await generalSettings(
      eventId,
      start_date,
      start_time,
      end_date,
      end_time,
      is_active,
      is_one_at_a_time,
      is_individual_category_assigned,
      is_Completed_Submission,
      is_jury_print_send_all,
      is_scoring_dropdown,
      is_comments_box_judging,
      is_data_single_page,
      is_total,
      is_jury_others_score,
      is_abstain,
      overall_score
    );

    if (eventResult.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.generalSettingsSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.generalsettingsError,  
      });
    }
    
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message ,
    });
  }
};


export const EventStatus = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, is_live, is_draft, is_archive } = req.body;

  const eventIdCheck = await checkeventId(eventId);

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const updates = {
    is_live: is_live !== undefined ? is_live : 0,
    is_draft: is_draft !== undefined ? is_draft : 0,
    is_archive: is_archive !== undefined ? is_archive : 0,
  };

  if (
    updates.is_live === 0 &&
    updates.is_draft === 0 &&
    updates.is_archive === 0
  ) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noFieldsToUpdate,
    });
  }
  try {
    const result = await statusEvent(eventId, updates);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.draftTOArchiveFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.EventArchiveSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const ScorecardCreate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, criteria, overall_scorecard } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const criteriaResults = [];

    for (const item of criteria) {
      const scoreCardResult = await CreateScorecardCriteria(
        eventId,
        item.title,
        item.description
      );
      criteriaResults.push(scoreCardResult);
    }

    const overallScorecardPromises = overall_scorecard.map((type) => {
      return overallScorecardValue(criteriaResults[0].id, eventId, type);
    });

    const overallResults = await Promise.all(overallScorecardPromises);

    if (overallResults.some((result) => result.id === undefined)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.overallvaluesFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.ScoreCradSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const CriteriaSettingCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { criteriaId, eventId, criteria_type, Values } = req.body;

  try {
    const result = await criteriaSettings(criteriaId, eventId, criteria_type);
    if (!result || result.id === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriawithoutcaptionvalue,
      });
    }

    const value1Result = await CreateCriteriaSettingValues(
      criteriaId,
      eventId,
      Values[0].settingId,
      Values[0].caption,
      Values[0].value
    );
    const value2Result = await CreateCriteriaSettingValues(
      criteriaId,
      eventId,
      Values[1].settingId,
      Values[1].caption,
      Values[1].value
    );

    if (value1Result.affectedRows > 0 && value2Result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.criteriawithcaptionvalueSuccess,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriaFail,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const deleteScoreCard = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const criteriaId = req.params.id;

  try {
    const isDeleted = await checkIfDeletedCriteriaId(criteriaId);

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriaIdDeletedalready,
      });
    }

    const deleteCriteriaSettingValue = await softDeleteCriteriaSettingValue(
      criteriaId
    );
    if (deleteCriteriaSettingValue.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorSettingValueDelete,
      });
    }

    const deleteCriteriaSetting = await softDeleteCriteriaSetting(criteriaId);
    if (deleteCriteriaSetting.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.valueDeletedNotSetting,
      });
    }

    const deleteCriteria = await softDeleteCriteria(criteriaId);
    if (deleteCriteria.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.valueSettingDeletedNotCriteria,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.criteriaDeleteSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const juryGroupCreate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    group_name,
    filtering_pattern,
    filtering_criterias,
    category,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const groupnameCreate = await CreateJuryGroup(
      eventId,
      group_name,
      filtering_pattern
    );

    if (!groupnameCreate || !groupnameCreate.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nogroupCreate,
      });
    }

    const filteringCriteriaPromises = filtering_criterias.map((item) =>
      CreateFilteringCriteria(
        eventId,
        groupnameCreate.id,
        item.category,
        item.isValue
      )
    );

    const filteringCriteriaResults = await Promise.all(
      filteringCriteriaPromises
    );

    if (filteringCriteriaResults.some((result) => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriafail,
      });
    }

    const insertedCategories = new Set();
    const categoryPromises = [];

    for (const criteria of filteringCriteriaResults) {
      for (const type of category) {
        const uniqueKey = `${criteria.id}_${type}`;

        if (!insertedCategories.has(uniqueKey)) {
          insertedCategories.add(uniqueKey);
          categoryPromises.push(
            CreateFilteringCriteriaCategory(
              eventId,
              groupnameCreate.id,
              criteria.id,
              type
            )
          );
        }
      }
    }

    const categoryValueResults = await Promise.all(categoryPromises);

    if (categoryValueResults.some((result) => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriaCategoryFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.juryGroupCreateSuccess,
    });
  } catch (error) {
    // console.error('Creation error:', error)
    return res.status(400).json({
      status: resposne.successFalse,
      message: `Error: ${error.message}`,
    });
  }
};

export const AssignJuryCreate = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const {
    eventId,
    group_name,
    email,
    first_name,
    last_name,
    is_readonly,
    is_auto_signin,
    is_assign_New,
    is_assign_close,
    is_assign_send,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await AssignJury(
      eventId,
      group_name,
      email,
      first_name,
      last_name,
      is_readonly,
      is_auto_signin,
      is_assign_New,
      is_assign_close
    );

    if (!result || !result.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.assignJuryCreateFail,
      });
    }
    if (is_assign_send) {
      const emailResult = await sendGmailAssign(
        first_name,
        last_name,
        email,
        group_name
      );
      if (emailResult) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: "Jury Assigned and Email sent Successfully",
          emailMessage: emailResult,
        });
      }
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.assignJuryCreateSuccess,
      id: result.id,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const Scorecardget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getScorecard();
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

export const ScorecardUpdate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, criteria, overall_scorecard } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const criteriaResults = [];

    for (const item of criteria) {
      const updatedCriteriaResult = await updateScorecardCriteria(
        item.id,
        item.title,
        item.description
      );
      criteriaResults.push(updatedCriteriaResult);
    }

    const overallScorecardPromises = criteriaResults.map(
      (criteriaResult, index) => {
        const criteriaId = criteriaResult.id;
        const score = overall_scorecard[index];
        return updateOverallScorecardValue(criteriaId, eventId, score);
      }
    );

    const overallResults = await Promise.all(overallScorecardPromises);

    if (overallResults.some((result) => result.id === undefined)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.overallvaluesUpdateFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.scorecardUpdateSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: ` Error: ${error.message}`,
    });
  }
};

export const CriteriaSettingUpdate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { criteriaId, eventId, criteria_type, Values } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const simpleresult = await updateCriteriaSettings(
      criteriaId,
      eventId,
      criteria_type
    );

    if (!simpleresult || simpleresult.id === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriawithoutcaptionvalue,
      });
    }

    const criteriaWithCaptionResults = [];
    const seenSettingIds = new Set();

    for (const item of Values) {
      if (!seenSettingIds.has(item.settingId)) {
        seenSettingIds.add(item.settingId);

        const WithcaptionValueResult = await updateCriteriaSettingValues(
          criteriaId,
          eventId,
          item.settingId,
          item.caption,
          item.value
        );
        criteriaWithCaptionResults.push(WithcaptionValueResult);
      }
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.criteriawithcaptionvalueSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const juryGroupUpdate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    groupId,
    eventId,
    group_name,
    filtering_pattern,
    filtering_criterias,
    category,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const groupUpdate = await UpdateJuryGroup(
      groupId,
      eventId,
      group_name,
      filtering_pattern
    );

    if (!groupUpdate || !groupUpdate.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nogroupUpdate,
      });
    }

    const filteringCriteriaPromises = filtering_criterias.map((item) =>
      UpdateFilteringCriteria(
        item.id,
        eventId,
        groupUpdate.id,
        item.category,
        item.isValue
      )
    );

    const filteringCriteriaResults = await Promise.all(
      filteringCriteriaPromises
    );

    if (filteringCriteriaResults.some((result) => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriafail,
      });
    }

    const insertedCategories = new Set();
    const categoryPromises = [];

    for (const criteria of filteringCriteriaResults) {
      for (const type of category) {
        const uniqueKey = `${criteria.id}_${type}`;

        if (!insertedCategories.has(uniqueKey)) {
          insertedCategories.add(uniqueKey);
          categoryPromises.push(
            UpdateFilteringCriteriaCategory(
              eventId,
              groupUpdate.id,
              criteria.id,
              type
            )
          );
        }
      }
    }

    const categoryValueResults = await Promise.all(categoryPromises);

    if (categoryValueResults.some((result) => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriaCategoryFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.juryGroupUpdateSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const deleteJuryGroup = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const groupId = req.params.id;

  try {
    const { isDeleted } = await checkifDeletedGroupId(groupId);

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.groupiddeletedalready,
      });
    }

    const deleteFilteringCriteriaCategory =
      await softDeleteFilteringCriteriaCategory(groupId);
    if (deleteFilteringCriteriaCategory.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorfilterCriteria,
      });
    }
    const deleteFilteringCriteria = await softDeleteFilteringCriteria(groupId);
    if (deleteFilteringCriteria.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.filterCriteriaDeletedNotfilterCriteria,
      });
    }
    const deletejuryGroup = await softDeleteJuryGroup(groupId);
    if (deletejuryGroup.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.filterCriteriaFilterCriteriaDeletedNotgroup,
      });
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.groupDeleteSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const JuryGroupGet = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getJuryGroup();
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

export const deleteGroupCriteria = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const filterId = req.params.id;

  try {
    const isDeleted = await checkIfDeletedFilterId(filterId);

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.filterIdDeletedAlready,
      });
    }

    const deletegroupCriteriaCategory = await softDeleteGroupCriteriaCategory(
      filterId
    );
    if (deletegroupCriteriaCategory.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorGroupCategoryDelete,
      });
    }
    const deleteGroupCriteria = await softDeleteGroupCriteria(filterId);
    if (deleteGroupCriteria.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.categoryDeletedNotJuryCriteria,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.filterDeleteSuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const JuryNameget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getJuryName();
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

export const AdminProfileget = async (req, res) => {
  const role = req.user.role;
  const adminId = req.user.id;
  // console.log("id",adminId)
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    const result = await getAdminProfile(adminId);

    if (result.admins.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result.admins,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const CreateCoupon = async (req, res) => {
  const { role } = req.user;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    category,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await createCoupon(
      eventId,
      category,
      coupon_name,
      coupon_code,
      percent_off,
      coupon_amount,
      start_date,
      end_date
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.couponCreatefail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.couponCreateSuccess,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const AwardByIdget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { awardId } = req.params;

  const isDeleted = await checkifDeleted(awardId);

  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.awardDeleted,
    });
  }

  const awardIdCheck = await checkAwardId(awardId);
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "no award id found",
    });
  }

  try {
    const result = await getAwardById(awardId);

    if (!result) {
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

//----------------------------------- Dynamic form create  ----------------------------------------//

//  Registration Form
export const createRegistrationForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, form_schema } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const result = await createRegistrationFormService(eventId, form_schema);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.regFormTrue,
        id: result.insertId,
        result: form_schema,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getRegistrationFormByEventId = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin" && role !== "user") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { registrationFormId, eventId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const RegFormIdCheck = await checkRegFormId(registrationFormId);
  if (!RegFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.regFormIdfail,
    });
  }

  try {
    const result = await getRegistrationFormService(
      eventId,
      registrationFormId
    );

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noregIdEventId,
      });
    }

    return res.status(200).json({
      status: resposne.successFalse,
      message: resposne.regFormFetch,
      data: result[0],
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateRegistrationForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, registrationFormId, form_schema } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const RegFormIdCheck = await checkRegFormId(registrationFormId);
  if (!RegFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.regFormIdfail,
    });
  }

  try {
    const result = await updateRegistrationFormService(eventId, registrationFormId, form_schema);
    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noformFound,
      });
    }
    return res
      .status(200)
      .json({
        status: resposne.successTrue,
        updatedId: registrationFormId,
        message: resposne.regUpdateSucess
      });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

// Entry Form

export const createEntryForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, form_schema } = req.body;

  try {
    const result = await createEntryFormService(eventId, form_schema);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.entryTrue,
        id: result.insertId,
        result: form_schema,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.entryFailed,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const getEntryFormByEventId = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin" && role !== "user") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, entryFormId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }
  const entryFormIdCheck = await checkentryFormId(entryFormId);
  if (!entryFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.entryFormIdfail,
    });
  }
  try {
    const result = await getEntryFormService(eventId, entryFormId);

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noentryIdEventId,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.entryFormFetch,
      data: result[0],
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const updateEntryForm = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, entryFormId, form_schema } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const entryFormIdCheck = await checkentryFormId(entryFormId);
  if (!entryFormIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.entryFormIdfail,
    });
  }

  try {
    const result = await updateEntryFormService(eventId, entryFormId, form_schema);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noformFound
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      updatedId: entryFormId,
      message: resposne.entrySuccess,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};
