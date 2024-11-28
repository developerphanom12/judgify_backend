const saltRounds = 10
import bcrypt from "bcrypt"
import resposne from "../middleware/resposne.js"
import { changeforgetPassword, changePassword, checkemail, checkemailOtp, checkphone, generateOTP, getCouponCodes, loginUser, storeOTP, userRegister, verifyOTP } from "../service/userService.js"
import sendGmail from "../mails/createUsermail.js"
import sendGmailotp from "../mails/sendOtp.js"
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

        const userid = await userRegister(
            first_name, last_name, email, hashedPassword, company, mobile_number, country
        )
        if (userid.error) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: userid.error
            })
        }

        try {
            const emailResult = await sendGmail(first_name, last_name, email, company, mobile_number, country)
            console.log("emailResult", emailResult)
            return res.status(200).json({
                status: true,
                message: resposne.usercreate,
                emailMessage: emailResult
            })
        } catch (emailError) {
            return res.status(200).json({
                status: true,
                message: emailError.message,
                // emailError: emailError.message
            })
        }

    } catch (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.message,
        })
    }
}

export const loginuser = async (req, res) => {
    const { email, password } = req.body

    try {
        const emailExists = await checkemail(email)

        if (!emailExists) {
            return res.status(400).json({
                status: resposne.successFalse,
                message: resposne.emailnotexist
            })
        }

        const loginResult = await loginUser(email, password)

        if (loginResult.data) {
            return res.status(200).json({
                status: resposne.successTrue,
                message: resposne.userlginsuccess,
                data: loginResult.data,
            })
        } else {
            return res.status(400).json({
                status: resposne.successFalse,
                message: loginResult.error,
            })
        }
    } catch (error) {
        // console.error("Error during login:", error)
        return res.status(400).json({
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
  

export const updatePassword = async (req, res) => {

    const { email, password } = req.body
    const emailExists = await checkemailOtp(email)

    if (!emailExists) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.otpnotverified,
        })
    }
    try {


        const result = await changePassword({ email, password })

        if (result.length > 0) {
            res.status(200).json({
                status: resposne.successTrue,
                message: result,
            })
        } else {
            res.status(400).json({
                status: resposne.successFalse,
                message: resposne.errorchangePass,
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

export const CouponCodesget = async (req, res) => {

    const role = req.user.role

    if (role !== "user") {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.unauth,
        })
    }
    const eventId = req.params.id

    const eventIdCheck = await checkeventId(eventId)
    if (!eventIdCheck) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.eventIdfail,
        })
    }
    try {

        const result = await getCouponCodes(eventId)
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
