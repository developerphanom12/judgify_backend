import Joi from "joi";
import resposne from "../middleware/resposne.js";

const userRegister = Joi.object({

    first_name: Joi.string().required().messages({
        "string.empty": "First name is not allowed to be empty",
        "any.required": "First name is required",
    }),
    last_name: Joi.string().required().messages({
        "string.empty": "Last name is not allowed to be empty",
        "any.required": "Last name is required",
    }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is not allowed to be empty.',
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        }),
    password: Joi
        .string()
        .min(8)
        .max(16)
        .required().messages({
            "string.empty": " Password is not allowed to be Empty",
            "string.min": " Password must be at least 8 characters long.",
            "string.max": " Password must not exceed 16 characters.",
            "any.required": "Password is required",
        }),
    company: Joi.string().required().messages({
        "string.empty": "Company is not allowed to be empty",
        "any.required": "Company is required",
    }),
    mobile_number: Joi.string()
        .length(10)
        .pattern(/[6-9]{1}[0-9]{9}/)
        .required()
        .messages({
            'string.length': 'Mobile number must be exactly 10 digits long',
            'string.pattern.base': 'Mobile number must start with digits 6-9 and contain only digits',
            'any.required': 'Mobile number is required',
        }),
    country: Joi.string().required().messages({
        "string.empty": "Country is not allowed to be empty",
        "any.required": "Country is required",
    }),
});

export const validateUser = (req, res, next) => {
    const { error } = userRegister.validate(req.body);

    if (error) {
        return res
            .status(400)
            .json({
                status: resposne.successFalse,
                message: error.details[0].message
            });
    }
    next();
};

const userLogin = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is not allowed to be empty.',
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        }),
    password: Joi
        .string()
        .min(8)
        .max(16)
        .required().messages({
            "string.empty": "Password is not allowed to be Empty",
            "string.min": "Password must be at least 8 characters long.",
            "string.max": "Password must not exceed 16 characters.",
            "any.required": "Password is required",
        }),
});

export const validateUserLogin = (req, res, next) => {
    const { error } = userLogin.validate(req.body);
    if (error) {
        return res
            .status(400)
            .json({
                status: resposne.successFalse,
                message: error.details[0].message
            });
    }
    next();
};

const OTPsend = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is not allowed to be empty.',
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        }),
});

export const validateotp = (req, res, next) => {
    const { error } = OTPsend.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.details[0].message
        });
    }

    next();
};

const OTPverify = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is not allowed to be empty.',
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        }),
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits long',
            'string.pattern.base': 'OTP must be exactly 6 digits consisting of numbers only',
            'any.required': 'OTP is required',
        }),
});

export const validateVerifyOtp = (req, res, next) => {
    const { error } = OTPverify.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: resposne.successFalse,
            message: error.details[0].message
        });
    }

    next();
};

const forgetPassword = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is not allowed to be empty.',
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.'
      }),
    newPassword: Joi.string()
      .required()
      .min(8)
      .max(16)
      .messages({
        "string.empty": "New Password Cannot be empty",
        "string.min": "New Password be Atleast 8 Characters Long",
        "string.max": "New Password should be less than 16 Characters",
        "any.required": "New Password is Required."
      }),
    confirmPassword: Joi.string()
      .required()
      .min(8)
      .max(16)
      .messages({
        "string.empty": "Confirm Password Cannot be empty",
        "string.min": "Confirm Password should be atleast 8 Characters Long",
        "string.max": "Confirm PAssword Should be Less than 16 Characters Long.",
        "any.required": "Confirm Password is Required."
      }),
  })
  
  export const validateupdateForgetPassword = (req, res, next) => {
    const { error } = forgetPassword.validate(req.body)
  
    if (error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: error.details[0].message
      })
    }
  
    next()
  }
  
