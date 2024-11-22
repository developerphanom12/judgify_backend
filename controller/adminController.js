const saltRounds = 10
import bcrypt from "bcrypt"
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
  deleteIndustryTypes,
  getEventById,
  updateEventSocial,
  addSubmissionId,
  publiclyVisible,
  generalSettings,
  overall_score,
  liveEvent,
  archiveEvent,
  CreateScorecardCriteria,
  overallScorecardValue,
  CreateCriteriaSettingValues,
  criteriaSettings,
  updateAdditionalEmails,
  deleteAdditionalEmails,
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
  getEmailwithOtp,
  checkOtpId,
  getAdminProfile,
  createCoupon,
  checkAdmin,
  checkeventEmail,
  additional_emailssss,
  getAwardById,
  checkAwardId,
  EmptyStartDate,
  EmptyEndDate,
} from "../service/adminService.js"
import resposne from "../middleware/resposne.js"
import path from "path"
import fs from 'fs'
import { fileURLToPath } from 'url'
import otpGenerator from "otp-generator"
import sendGmailAssign from "../mails/mail.js"
import sendGmailotp from "../mails/sendOtp.js"


export const usercreate = async (req, res) => {
  const { first_name, last_name, email, password, company, mobile_number, country } = req.body
  const emailcheck = await checkemail(email)
  if (emailcheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkEmail,
    })
  }

  const phone = await checkphone(mobile_number)
  if (phone) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkphone,
    })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const userid = await adminRegister(
      first_name, last_name, email, hashedPassword, company, mobile_number, country
    )

    if (userid.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.adminfailed,
      })
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.admincreate,
      })
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const loginseller = async (req, res) => {
  const { email, password } = req.body
  const emailExists = await checkemail(email)

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist
    })

  }
  try {

    const loginResult = await loginAdmin(
      email,
      password
    )
    // console.log("loginresult", loginResult)
    if (loginResult.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: loginResult.error,
      })
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.adminlginsuccess,
        data: loginResult.data,
      })
    }
  }
  catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const updateProfile = async (req, res) => {
  const role = req.user.role
  const userId = req.user.id

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  const { first_name, last_name, email, company, mobile_number, time_zone, job_title } = req.body
  const profile_image = req.file

  try {


    const updates = {}

    if (first_name) updates.first_name = first_name
    if (last_name) updates.last_name = last_name
    if (email) updates.email = email
    if (company) updates.company = company
    if (mobile_number) updates.mobile_number = mobile_number
    if (time_zone) updates.time_zone = time_zone
    if (job_title) updates.job_title = job_title
    if (profile_image) updates.imageFilename = profile_image.filename

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.noupdate,
      })
    }

    const result = await updateprofile(updates, userId)
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.updateFail,
      })

    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.updateSuccess,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const sendOTP = async (req, res) => {
  const { email } = req.body
  const emailExists = await checkemail(email)

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist,
    })
  }

  try {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    })


    const storedotp = await storeOTP(email, otp)
    if (storedotp.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpstorefailed,
      })
    }
    const sendotpemail = await sendGmailotp(email, otp)

    if (sendotpemail) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "Error while sending OTP to email.",
      })
    }


    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.otpsend,
    })

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}


export const verifyOTPHandler = async (req, res) => {
  const { email, otp } = req.body
  const emailExists = await checkemail(email)

  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist,
    })
  }
  try {
    const verifiedotp = await verifyOTP(email, otp)

    if (verifiedotp.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpverifyfailed,
      })
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.otpverified,
      })
    }

  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const updateforgetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body

  const emailExists = await checkemailOtp(email)
  if (!emailExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.otpnotverified,
    })
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.newPass,
    })
  }

  try {
    const result = await changeforgetPassword({ email, newPassword })

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorchangePass,
      })
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.passupdateSuccess,
      })
    }

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

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
      message: "No admin Id found or Admin does not exist",
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

  const checkEmail = await checkeventEmail(email)
  if (checkEmail) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "email already exist."
    })
  }
  try {

    if (limit_submission === 1 && (submission_limit === undefined || submission_limit < 1)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submisionlimit
      });
    }

    const logo = req.files["event_logo"] ? req.files["event_logo"][0].filename : null;
    const banner = req.files["event_banner"] ? req.files["event_banner"][0].filename : null;

    if (!logo && !banner) {
      console.warn('Both logo and banner are not provided.');
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
    const emailcreate = await additional_emailssss(eventResult.id, additional_email)
    if (emailcreate.error) {
      return res.status(400).json({
        status: false,
        message: "failed to create additional email"
      })
    }

    const indstrycreate = await industry_types(eventResult.id, industry_type)
    if (indstrycreate.error) {
      return res.status(400).json({
        status: false,
        message: "error.message"
      })
    }


    return res.status(200).json({
      status: resposne.successTrue,
      message: "resposne.createvent",
    });
  } catch (error) {
    console.log("erro creating event", error)
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};


export const awardCreate = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
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
  } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
  }

  if (is_start_date === 1 && (!start_date || start_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_start_REquired,
    })
  }

  if (is_end_date === 1 && (!end_date || end_date < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.is_end_REquired,
    })
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
    )

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.awardcreatefail,
      })
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.awardcreate,
      })
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const Awardsget = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, search, sortOrder } = req.query;
  const searchTerm = search && search.trim() !== '' ? search : null;
  const order = sortOrder === 'oldest' ? 'oldest' : 'newest';

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


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const directoryPath = path.resolve(__dirname, '../files')

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath)
}

export const exportCsv = async (req, res) => {
  const role = req.user.role;
  const eventId = req.query.eventId;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  try {
    // console.log('Event ID:', eventId);

    const sheet = await exportToExcel(eventId);

    const filePath = path.join(directoryPath, 'Awards Category.xlsx');

    fs.writeFileSync(filePath, sheet);

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.downloadSuccess,
      path: filePath,
    });
  } catch (error) {
    // console.error('Error exporting to Excel:', error);
    res.status(400).send({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const dashboardEvents = async (req, res) => {
  const role = req.user.role
  const id = req.user.id
  // console.log("id", id, role)
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  try {
    const result = await getEventDashboard(id)
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      })
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}


export const NewPassword = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  const search = req.query
  const userId = req.user.id
  const { currentPassword, newPassword } = req.body

  const passwordExists = await checkCurrentPass(userId, currentPassword)
  if (passwordExists.error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkCurrentPass,
    })
  }

  try {
    const result = await newPasswordd({ userId, search, currentPassword, newPassword })
    if (result.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "error in create new password"
      })
    }
    res.status(200).json({
      status: resposne.successTrue,
      message: result,
    })
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
    // console.log("error", error.message)
  }
}

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

  // console.log("Query Params:", req.query); 

  const sortOrder = order === 'oldest' ? 'oldest' : 'newest';

  // console.log("Sort order:", sortOrder);  

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
    end_date
  } = req.body;

  const updates = {};

  if (category_name) updates.category_name = category_name;
  if (category_prefix) updates.category_prefix = category_prefix;
  if (belongs_group) updates.belongs_group = belongs_group;
  if (limit_submission !== undefined) updates.limit_submission = limit_submission;
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
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const awardId = req.params.id
  const isDeleted = await checkifDeleted(awardId)
  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.awardalreadyDeleted,
    })
  }
  try {
    const message = await softDeleteAward(awardId)
    if (message.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.deleteAwardError
      })
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.awardDeleted,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const eventUpdate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { eventId } = req.body

  if (!eventId) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdRequired,
    })
  }

  const {
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    additional_email,
    is_endorsement,
    is_withdrawal,
    is_ediit_entry,
    limit_submission,
    submission_limit,
    industry_type,
  } = req.body

  if (additional_email && additional_email.includes(email)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.diffrentemail,
    })
  }

  try {
    const eventExists = await checkeventId(eventId)

    if (!eventExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.eventIdfail,
      })
    }

    await updateEventDetails(
      eventId,
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
      submission_limit
    )

    if (industry_type) {
      await deleteIndustryTypes(eventId)
      const industryTypes = Array.isArray(industry_type) ? industry_type : [industry_type]
      const industryPromises = industryTypes.map(type =>
        industry_types(eventId, type)
      )
      await Promise.all(industryPromises)
    }

    if (additional_email) {
      await deleteAdditionalEmails(eventId)
      const additionalEmailsArray = Array.isArray(additional_email) ? additional_email : [additional_email]
      const additionalEmailPromises = additionalEmailsArray.map(email =>
        updateAdditionalEmails(eventId, email)
      )
      await Promise.all(additionalEmailPromises)
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.updateventSuccess,
      eventId,
    })
  } catch (error) {
    // console.error("Error updating event:", error)
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const MyEventget = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { event_id } = req.params

  if (!event_id) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdRequired,
    })
  }

  try {
    const result = await getEventById(event_id)

    if (!result) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const eventupdateSocial = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const eventId = parseInt(req.body.eventId, 10)
  const event_description = req.body.event_description
  const closing_messsage = req.body.closing_messsage
  const jury_welcm_messsage = req.body.jury_welcm_messsage
  const is_social = req.body.is_social ? parseInt(req.body.is_social, 10) : undefined
  const social = req.body.social

  const { event_logo, event_banner, social_image } = req.files || {}

  const updates = {
    event_description,
    closing_messsage,
    jury_welcm_messsage,
    is_social,
    social,
  }

  if (event_logo) updates.imageFilename = event_logo[0].filename
  if (event_banner) updates.event_banner = event_banner[0].filename
  if (social_image) updates.social_image = social_image[0].filename

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.noupdate,
    })
  }

  try {
    const result = await updateEventSocial(updates, eventId)

    if (!result) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.updateFail,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.updateSuccess,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const SubmissionFormatCreate = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth
    })
  }

  const { id, submission_id } = req.body

  const eventIdCheck = await checkeventId(id)

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail
    })
  }

  try {
    const result = await addSubmissionId(id, submission_id)

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submissionFormatFail
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.submissionFormatSuccess
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message
    })
  }
}

export const visiblePublicly = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth
    })
  }

  const { id, is_publicly_visble } = req.body

  const eventIdCheck = await checkeventId(id)

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail
    })
  }

  try {
    const result = await publiclyVisible(id, is_publicly_visble)

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.publicVisibleFalse
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.publicVisibleTrue
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message
    })
  }
}

export const CreateGeneralSettings = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth
    })
  }
  const {
    eventId,
    start_date,
    end_date,
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
    overallScore,
  } = req.body
  const eventIdCheck = await checkeventId(eventId)

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail
    })
  }
  try {
    const eventResult = await generalSettings(
      eventId,
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
      is_abstain
    )

    if (overallScore && overallScore[0]) {
      const result = await overall_score(eventResult.id, overallScore[0])
      if (result.affectedRows === 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.overallScoreFail,
        })
      }
    }

    if (start_date || end_date) {
      const updateResult = await startEndUpdate(eventId, start_date, end_date)
      if (updateResult.affectedRows === 0) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.noaffectedRowwithstartEnd,
        })
      }
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.generalSettingandUpdatedates,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.generalSettingsUpdatewithoutDate,
    })

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message || resposne.generalsettingsError,
    })
  }
}


export const EventLive = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth
    })
  }

  const { eventId, is_live } = req.body

  const eventIdCheck = await checkeventId(eventId)

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail
    })
  }

  try {
    const result = await liveEvent(eventId, is_live)

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.draftTOLiveFail
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.draftTOLiveSuccess
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message
    })
  }
}

export const EventArchive = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth
    })
  }

  const { eventId, is_archive } = req.body

  const eventIdCheck = await checkeventId(eventId)

  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail
    })
  }

  try {
    const result = await archiveEvent(eventId, is_archive)

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.draftTOArchiveFail
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.EventArchiveSuccess
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message
    })
  }
}

export const ScorecardCreate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { eventId, criteria, overall_scorecard } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
  }

  try {
    const criteriaResults = []

    for (const item of criteria) {
      const scoreCardResult = await CreateScorecardCriteria(eventId, item.title, item.description)
      criteriaResults.push(scoreCardResult)
    }

    const overallScorecardPromises = overall_scorecard.map(type => {
      return overallScorecardValue(criteriaResults[0].id, eventId, type)
    })

    const overallResults = await Promise.all(overallScorecardPromises)

    if (overallResults.some(result => result.id === undefined)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.overallvaluesFail,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.ScoreCradSuccess
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const CriteriaSettingCreate = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { criteriaId, eventId, criteria_type, Values } = req.body

  try {
    const result = await criteriaSettings(criteriaId, eventId, criteria_type)
    if (!result || result.id === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriawithoutcaptionvalue,
      })
    }

    const value1Result = await CreateCriteriaSettingValues(criteriaId, eventId, Values[0].settingId, Values[0].caption, Values[0].value)
    const value2Result = await CreateCriteriaSettingValues(criteriaId, eventId, Values[1].settingId, Values[1].caption, Values[1].value)

    if (value1Result.affectedRows > 0 && value2Result.affectedRows > 0) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.criteriawithcaptionvalueSuccess,
      })
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriaFail,
      })
    }

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}


export const deleteScoreCard = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const criteriaId = req.params.id

  try {
    const isDeleted = await checkIfDeletedCriteriaId(criteriaId)

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriaIdDeletedalready,
      })
    }

    const deleteCriteriaSettingValue = await softDeleteCriteriaSettingValue(criteriaId)
    if (deleteCriteriaSettingValue.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorSettingValueDelete,
      })
    }

    const deleteCriteriaSetting = await softDeleteCriteriaSetting(criteriaId)
    if (deleteCriteriaSetting.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.valueDeletedNotSetting,
      })
    }

    const deleteCriteria = await softDeleteCriteria(criteriaId)
    if (deleteCriteria.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.valueSettingDeletedNotCriteria,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.criteriaDeleteSuccess,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}



export const juryGroupCreate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { eventId, group_name, filtering_pattern, filtering_criterias, category } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
  }

  try {
    const groupnameCreate = await CreateJuryGroup(eventId, group_name, filtering_pattern)

    if (!groupnameCreate || !groupnameCreate.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nogroupCreate,
      })
    }

    const filteringCriteriaPromises = filtering_criterias.map(item =>
      CreateFilteringCriteria(eventId, groupnameCreate.id, item.category, item.isValue)
    )

    const filteringCriteriaResults = await Promise.all(filteringCriteriaPromises)

    if (filteringCriteriaResults.some(result => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriafail,
      })
    }

    const insertedCategories = new Set()
    const categoryPromises = []

    for (const criteria of filteringCriteriaResults) {
      for (const type of category) {
        const uniqueKey = `${criteria.id}_${type}`

        if (!insertedCategories.has(uniqueKey)) {
          insertedCategories.add(uniqueKey)
          categoryPromises.push(CreateFilteringCriteriaCategory(
            eventId,
            groupnameCreate.id,
            criteria.id,
            type
          ))
        }
      }
    }

    const categoryValueResults = await Promise.all(categoryPromises)

    if (categoryValueResults.some(result => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriaCategoryFail,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.juryGroupCreateSuccess,
    })
  } catch (error) {
    // console.error('Creation error:', error)
    return res.status(400).json({
      status: resposne.successFalse,
      message: `Error: ${error.message}`,
    })
  }
}


export const AssignJuryCreate = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
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
    is_assign_send
  } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
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
      is_assign_close,
    )

    if (!result || !result.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.assignJuryCreateFail,
      })
    }
    if (is_assign_send) {
      const emailResult = await sendGmailAssign(first_name, last_name, email, group_name)
      if (emailResult) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: "Jury Assigned and Email sent Successfully",
          emailMessage: emailResult
        })
      }
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.assignJuryCreateSuccess,
      id: result.id,
    })

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const Scorecardget = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  try {
    const result = await getScorecard()
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      })
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const ScorecardUpdate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { eventId, criteria, overall_scorecard } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
  }

  try {
    const criteriaResults = []

    for (const item of criteria) {
      const updatedCriteriaResult = await updateScorecardCriteria(item.id, item.title, item.description)
      criteriaResults.push(updatedCriteriaResult)
    }

    const overallScorecardPromises = criteriaResults.map((criteriaResult, index) => {
      const criteriaId = criteriaResult.id
      const score = overall_scorecard[index]
      return updateOverallScorecardValue(criteriaId, eventId, score)
    })

    const overallResults = await Promise.all(overallScorecardPromises)

    if (overallResults.some(result => result.id === undefined)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.overallvaluesUpdateFail,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.scorecardUpdateSuccess
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: ` Error: ${error.message}`,
    })
  }

}

export const CriteriaSettingUpdate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { criteriaId, eventId, criteria_type, Values } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
  }

  try {
    const simpleresult = await updateCriteriaSettings(criteriaId, eventId, criteria_type)

    if (!simpleresult || simpleresult.id === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriawithoutcaptionvalue,
      })
    }

    const criteriaWithCaptionResults = []
    const seenSettingIds = new Set()

    for (const item of Values) {
      if (!seenSettingIds.has(item.settingId)) {
        seenSettingIds.add(item.settingId)

        const WithcaptionValueResult = await updateCriteriaSettingValues(
          criteriaId,
          eventId,
          item.settingId,
          item.caption,
          item.value)
        criteriaWithCaptionResults.push(WithcaptionValueResult)
      }
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.criteriawithcaptionvalueSuccess,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const juryGroupUpdate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { groupId, eventId, group_name, filtering_pattern, filtering_criterias, category } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
  }

  try {
    const groupUpdate = await UpdateJuryGroup(groupId, eventId, group_name, filtering_pattern)

    if (!groupUpdate || !groupUpdate.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nogroupUpdate,
      })
    }

    const filteringCriteriaPromises = filtering_criterias.map(item =>
      UpdateFilteringCriteria(item.id, eventId, groupUpdate.id, item.category, item.isValue)
    )

    const filteringCriteriaResults = await Promise.all(filteringCriteriaPromises)

    if (filteringCriteriaResults.some(result => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriafail,
      })
    }

    const insertedCategories = new Set()
    const categoryPromises = []

    for (const criteria of filteringCriteriaResults) {
      for (const type of category) {
        const uniqueKey = `${criteria.id}_${type}`

        if (!insertedCategories.has(uniqueKey)) {
          insertedCategories.add(uniqueKey)
          categoryPromises.push(UpdateFilteringCriteriaCategory(
            eventId,
            groupUpdate.id,
            criteria.id,
            type
          ))
        }
      }
    }

    const categoryValueResults = await Promise.all(categoryPromises)

    if (categoryValueResults.some(result => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertFilteringCriteriaCategoryFail,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.juryGroupUpdateSuccess,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const deleteJuryGroup = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const groupId = req.params.id

  try {
    const { isDeleted } = await checkifDeletedGroupId(groupId)

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.groupiddeletedalready,
      })
    }

    const deleteFilteringCriteriaCategory = await softDeleteFilteringCriteriaCategory(groupId)
    if (deleteFilteringCriteriaCategory.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorfilterCriteria,
      })
    }
    const deleteFilteringCriteria = await softDeleteFilteringCriteria(groupId)
    if (deleteFilteringCriteria.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.filterCriteriaDeletedNotfilterCriteria,
      })
    }
    const deletejuryGroup = await softDeleteJuryGroup(groupId)
    if (deletejuryGroup.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.filterCriteriaFilterCriteriaDeletedNotgroup,
      })
    }
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.groupDeleteSuccess,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const JuryGroupGet = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  try {
    const result = await getJuryGroup()
    if (result.length > 0) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      })
    } else {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const deleteGroupCriteria = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const filterId = req.params.id

  try {
    const isDeleted = await checkIfDeletedFilterId(filterId)

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.filterIdDeletedAlready,
      })
    }

    const deletegroupCriteriaCategory = await softDeleteGroupCriteriaCategory(filterId)
    if (deletegroupCriteriaCategory.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.errorGroupCategoryDelete,
      })
    }
    const deleteGroupCriteria = await softDeleteGroupCriteria(filterId)
    if (deleteGroupCriteria.affectedRows === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.categoryDeletedNotJuryCriteria,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.filterDeleteSuccess,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const JuryNameget = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  try {

    const result = await getJuryName()
    if (result.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const GetEmailForVerify = async (req, res) => {
  const otpId = req.params.otpId

  try {
    const otpIdCheck = await checkOtpId(otpId)

    if (!otpIdCheck) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpIdfail,
      })
    }

    const result = await getEmailwithOtp(otpId)

    if (!result || !result.email) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: result,
    })

  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const AdminProfileget = async (req, res) => {
  const role = req.user.role
  const adminId = req.user.id
  // console.log("id",adminId)
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }


  try {
    const result = await getAdminProfile(adminId)

    if (result.admins.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result.admins,
      })
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const CreateCoupon = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const {
    eventId,
    category,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date
  } = req.body

  const eventIdCheck = await checkeventId(eventId)
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    })
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
    )

    if (result.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.couponCreatefail,
      })
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.couponCreateSuccess,
      })
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const AwardByIdget = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const { awardId } = req.params

  const isDeleted = await checkifDeleted(awardId)

  if (isDeleted) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.awardDeleted,
    })
  }

  const awardIdCheck = await checkAwardId(awardId)
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "no award id found",
    })
  }

  try {
    const result = await getAwardById(awardId)

    if (!result) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      })
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      })
    }
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}
