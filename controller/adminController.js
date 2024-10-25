const saltRounds = 10
import bcrypt from "bcrypt"
import { adminRegister, changeforgetPassword, checkemail, checkemailOtp, checkeventId, checkphone, createAward, createEvent, exportToExcel, getAwards, getEventDashboard, getMyEvents, loginAdmin, searchEvent, sortbynewest, sortbyoldest, storeOTP, updateprofile, verifyOTP, newPasswordd, checkCurrentPass, updateAward, softDeleteAward, checkifDeleted, industry_types, updateEventDetails, deleteIndustryTypes, getEventById, updateEventSocial, addSubmissionId, publiclyVisible, generalSettings, overall_score, StartEndUpdate, liveEvent, archiveEvent, CreateScorecardCriteria, overallScorecardValue, CreateCriteriaSettingValues, criteriaSettings, checkIfDeletedCriteria, softDeleteCriteria, softDeleteSettingsValuesByCriteriaId, softDeleteSettingsByCriteriaId, additional_emails, updateAdditionalEmails, deleteAdditionalEmails, CreateJuryGroup, CreateFilteringCriteria, CreateFilteringCriteriaCategory, AssignJury, } from "../service/adminService.js"
import resposne from "../middleware/resposne.js"
import path from "path"
import fs from 'fs'
import { fileURLToPath } from 'url'
import otpGenerator from "otp-generator"


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

    if (loginResult === 0) {
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

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  const userId = req.user.id
  const { first_name, last_name, email, company, mobile_number, time_zone, job_title } = req.body
  const profile_image = req.file
  if (!profile_image) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.imageRequire,
    })
  }
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
      message: resposne.emailnotexist
    })
  }
  try {

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    })
    const storedotp = await storeOTP(email, otp)
    if (storedotp.length === 0) {
      res.status(400).json({
        status: resposne.successFalse,
        message: resposne.otpstorefailed,
      })
    } else {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.otpsend,
      })
    }
  } catch (error) {
    res.status(400).json({
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
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
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
  } = req.body

  if (additional_email.includes(email)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.diffrentemail,
    })
  }

  if (limit_submission === 1 && (submission_limit === undefined || submission_limit < 1)) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.submisionlimit,
    })
  }

  try {
    const logo = req.files["event_logo"] ? req.files["event_logo"][0].filename : null
    const banner = req.files["event_banner"] ? req.files["event_banner"][0].filename : null

    if (!logo && !banner) {
      console.warn('Both logo and banner are not provided.')
    }

    const eventResult = await createEvent(
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
    )

    const industryPromises = industry_type.map(type =>
      industry_types(eventResult.id, type)
    )

    await Promise.all(industryPromises)

    const additionalEmailPromises = additional_email.map(email =>
      additional_emails(eventResult.id, email)
    )

    await Promise.all(additionalEmailPromises)

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.createvent,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

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
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  try {
    const result = await getAwards()
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const directoryPath = path.resolve(__dirname, '../files')

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath)
}

export const exportCsv = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  try {
    const sheet = await exportToExcel()

    const filePath = path.join(directoryPath, 'Awards Category.xlsx')

    fs.writeFileSync(filePath, sheet)

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.downloadSuccess,
      path: filePath
    })
  } catch (error) {
    res.status(400).send({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const dashboardEvents = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  try {
    const result = await getEventDashboard()
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

  const userId = req.user.id
  const { currentPassword, newPassword, confirmPassword } = req.body

  const passwordExists = await checkCurrentPass(currentPassword)
  if (!passwordExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.checkCurrentPass,
    })
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.newPass,
    })
  }

  try {
    const result = await newPasswordd({ userId, currentPassword, newPassword })

    res.status(200).json({
      status: resposne.successTrue,
      message: result,
    })
  } catch (error) {
    res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

export const MyEventsget = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  const { skip, limit } = req.query

  try {
    const parsedSkip = parseInt(skip, 8) || 0
    const parsedLimit = parseInt(limit, 8) || 8
    const result = await getMyEvents(parsedSkip,
      parsedLimit)
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

export const SortByOldest = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  try {
    const result = await sortbyoldest()
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

export const SortBynewest = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  try {
    const result = await sortbynewest()
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

export const SearchEvent = async (req, res) => {
  try {
    const { search } = req.query
    const result = await searchEvent(search)
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

export const awardUpdate = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
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
  } = req.body

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
    )

    if (result.message) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.awardUpdateSuccess,
      })
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.awardUpdateFail,
      })
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

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
    if(message.affectedRows === 0){
      return res.status(400).json({
        status:resposne.successFalse,
        message:resposne.deleteAwardError
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
    return res.status(403).json({
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
      return res.status(404).json({
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
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
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
    event_id
  } = req.body

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

    const overallScorePromises = overallScore.map(score =>
      overall_score(eventResult.id, score)
    )

    await Promise.all(overallScorePromises).catch(err => {
      // console.error("Error inserting overall scores:", err)
      throw new Error(resposne.overallScoreFail)
    })

    if (start_date || end_date) {
      const updateResult = await StartEndUpdate(event_id, start_date, end_date)

      if (updateResult.affectedRows > 0) {
        return res.status(200).json({
          status: resposne.successTrue,
          message: resposne.generalSettingandUpdatedates,
        })
      } else {
        return res.status(400).json({
          status: resposne.successFalse,
          message: resposne.noaffectedRowwithstartEnd,
        })
      }
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.generalSettingsUpdatewithoutDate,
      })
    }
  } catch (error) {
    // console.error("Error creating general settings:", error)
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
    const simpleresult = await criteriaSettings(criteriaId, eventId, criteria_type)

    if (!simpleresult || simpleresult.id === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriawithoutcaptionvalue,
      })
    }

    const criteriaWithCaptionResults = []
    const seenSettingIds = new Set()

    if (Array.isArray(Values) && Values.length > 0) {
      for (const item of Values) {
        if (!seenSettingIds.has(item.settingId)) {
          seenSettingIds.add(item.settingId)
          const WithcaptionValueResult = await CreateCriteriaSettingValues(criteriaId, eventId, item.settingId, item.caption, item.value)
          criteriaWithCaptionResults.push(WithcaptionValueResult)
        }
      }
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.criteriawithcaptionvalueSuccess,
    })
  } catch (error) {
    // console.error("Error creating criteria setting:", error)
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}


export const deleteCriteria = async (req, res) => {
  const { role } = req.user

  if (role !== "admin") {
    return res.status(403).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const criteriaId = req.params.id

  try {
    const { isDeleted } = await checkIfDeletedCriteria(criteriaId)

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriaAlreadyDeleted,
      })
    }

    const [settingsValueDeleted, settingsDeleted, criteriaDeleted] = await Promise.all([
      softDeleteSettingsValuesByCriteriaId(criteriaId),
      softDeleteSettingsByCriteriaId(criteriaId),
      softDeleteCriteria(criteriaId),
    ])

    let message = resposne.criteriaDeleted

    if (settingsValueDeleted.affectedRows === 0) {
      message += resposne.nodeletedSettingvalue
    }

    if (settingsDeleted.affectedRows === 0) {
      message += resposne.nodeletedSetting
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
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const { eventId, group_name, filtering_pattern, filtering_criterias, category } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  try {
    const groupnameCreate = await CreateJuryGroup(eventId, group_name, filtering_pattern);

    if (!groupnameCreate || !groupnameCreate.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nogroupCreate,
      });
    }

    const filteringCriteriaPromises = filtering_criterias.map(item =>
      CreateFilteringCriteria(eventId, groupnameCreate.id, item.category, item.isValue)
    );

    const filteringCriteriaResults = await Promise.all(filteringCriteriaPromises);

    if (filteringCriteriaResults.some(result => !result || !result.id)) {
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
          categoryPromises.push(CreateFilteringCriteriaCategory(eventId, groupnameCreate.id, criteria.id, type, criteria.isValue));
        }
      }
    }

    const categoryValueResults = await Promise.all(categoryPromises);

    if (categoryValueResults.some(result => !result || !result.id)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.insertfilteringcriteriacategoryFail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.juryGroupCreateSuccess,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

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
    is_auto_signin
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
      is_auto_signin
    );

    if (!result || !result.id) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.assignJuryCreateFail,
      });
    } else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.assignJuryCreateSuccess,
        id: result.id,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}
