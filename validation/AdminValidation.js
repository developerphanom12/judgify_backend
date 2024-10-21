import Joi from "joi";
import resposne from "../middleware/resposne.js";

const adminRegister = Joi.object({

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
      "string.empty": " Mobile number is not allowed to be Empty",
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with digits 6-9 and contain only digits',
      'any.required': 'Mobile number is required',
    }),
  country: Joi.string().required().messages({
    "string.empty": "Country is not allowed to be empty",
    "any.required": "Country is required",
  }),
});

export const validateAdmin = (req, res, next) => {
  const { error } = adminRegister.validate(req.body);

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

const adminLogin = Joi.object({
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
});

export const validateAdminLogin = (req, res, next) => {
  const { error } = adminLogin.validate(req.body);
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
    "string.empty":"New Password Cannot be empty",
    "string.min":"New Password be Atleast 8 Characters Long",
    "string.max":"New Password should be less than 16 Characters",
    "any.required":"New Password is Required."
  }),
  confirmPassword: Joi.string()
  .required()
  .min(8)
  .max(16)
  .messages({
    "string.empty":"Confirm Password Cannot be empty",
    "string.min":"Confirm Password should be atleast 8 Characters Long",
    "string.max":"Confirm PAssword Should be Less than 16 Characters Long.",
    "any.required":"Confirm Password is Required."
  }),
});

export const validateupdateForgetPassword = (req, res, next) => {
  const { error } = forgetPassword.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message
    });
  }

  next();
};

const eventCreate = Joi.object({
  event_name: Joi.string().required().messages({
    "string.empty": "Event Name is not allowed to be empty",
    "any.required": "Event Name is required",
  }),
  industry_type: Joi.string().required().messages({
    "string.empty": "Industry Type is not allowed to be empty",
    "any.required": "Industry Type is required",
  }),
  closing_date: Joi.string().required().messages({
    "string.empty": "Closing Date is not allowed to be empty",
    "any.required": "Closing Date is required",
  }),
  closing_time: Joi.string().required().messages({
    "string.empty": "Closing Time is not allowed to be empty",
    "any.required": "Closing Time is required",
  }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is not allowed to be empty.',
      'string.email': 'Email must be a valid email address.',
      'any.required': 'Email is required.'
    }),
  event_url: Joi.string().required().messages({
    "string.empty": "Event Url is not allowed to be empty",
    "any.required": "Event Url is required",
  }),
  time_zone: Joi.string().required().messages({
    "string.empty": "Time Zone is not allowed to be empty",
    "any.required": "Time Zone is required",
  }),
  additional_email: Joi.string()
    .email()
    .messages({
      'string.email': 'Additonal Email must be a valid email address.',
    }),
  is_endorsement: Joi.number().valid(0, 1).messages({
    'any.only': 'Value must be either 0 or 1',
    'any.required': 'Endorsement field is required',
  }),
  is_withdrawal: Joi.number().valid(0, 1).messages({
    'any.only': 'Value must be either 0 or 1',
    'any.required': 'Withdrawal field is required',
  }),
  is_edit_entry: Joi.number().valid(0, 1).messages({
    'any.only': 'Value must be either 0 or 1',
    'any.required': 'Edit Entry field is required',
  }),
  limit_submission: Joi.number().valid(0, 1).messages({
    'any.only': 'Value must be either 0 or 1',
    'any.required': 'Limit Submission field is required',
  }),
  submission_limit: Joi.number().messages({
    'any.only': 'Value must be either 0 or 1',
    'any.required': 'Submission Limit field is required',
  }),
  event_description: Joi.string().optional().messages({
    "string.empty": "Event Description cannot be empty",
  }),
});

export const validateEventCreate = (req, res, next) => {
  const { error } = eventCreate.validate(req.body,{ abortEarly: false });
  if (error) {

    return res.status(400).json({
      status: resposne.successFalse,
      message:  error.message,
    });
  }

  if (!req.files || !req.files.event_logo || !req.files.event_banner) {
    return res.status(400).json({
      status: resposne.successFalse, 
      message: resposne.logobanner,
    });
  }

  next();
};

const awardCreate = Joi.object({
  eventId: Joi.string().required().messages({
    "string.empty": "Event Id is not allowed to be empty",
    "any.required": "Event Id is required",
  }),
  category_name: Joi.string().required().messages({
    "string.empty": "Category Name is not allowed to be empty",
    "any.required": "Category Name is required",
  }),
  category_prefix: Joi.string().required().messages({
    "string.empty": "Category Prefix is not allowed to be empty",
    "any.required": "Category Prefix is required",
  }),
  belongs_group: Joi.string().required().messages({
    "string.empty": "Belongs Group is not allowed to be empty",
    "any.required": "Belongs Group is required",
  }),
  limit_submission: Joi.number().integer().messages({
    'number.base': 'Limit Submission must be a valid number',
    'any.required': 'Limit Submission is required',
  }),
  is_start_date: Joi.number().valid(0, 1).required().messages({
    'any.only': 'is Start Date must be either 0 or 1',
    'any.required': 'is Start Date field is required',
  }),
  is_end_date: Joi.number().valid(0, 1).required().messages({
    'any.only': 'is End Date must be either 0 or 1',
    'any.required': 'is End Date field is required',
  }),
  is_endorsement: Joi.number().valid(0, 1).required().messages({
    'any.only': 'Endorsement value must be either 0 or 1',
    'any.required': 'Endorsement value field is required',
  }), 
   start_date: Joi.string().messages({
    'string.empty': "Start date cannot be empty",
    'string.Date': "Start date must be a valid date",
  }),
  end_date: Joi.string().messages({
    'string.empty': "End date cannot be empty",
    'string.Date': "End date must be a valid date",
  }),
});

export const validateAwardCreate = (req, res, next) => {
  const { error } = awardCreate.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message
    });
  }

  next();
}


const newPassword = Joi.object({
  currentPassword: Joi
    .string()
    .min(8)
    .max(16)
    .required().messages({
      "string.empty": " Password is not allowed to be Empty",
      "string.min": " Password must be at least 8 characters long.",
      "string.max": " Password must not exceed 16 characters.",
      "any.required": "Password is required",
    }),
  newPassword: Joi
    .string()
    .min(8)
    .max(16)
    .required().messages({
      "string.empty": " New password is not allowed to be Empty",
      "string.min": " New Password must be at least 8 characters long.",
      "string.max": " New Password must not exceed 16 characters.",
      "any.required": "New password is required",
    }),
  confirmPassword: Joi.string().required().messages({
    'any.required': 'Confirm password is required.',
  }),
});

export const validateNewPass = (req, res, next) => {
  const { error } = newPassword.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.details[0].message
    });
  }

  next();
}

const UpdateadminProfile = Joi.object({

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
  time_zone: Joi.string().required().messages({
    "string.empty": "Time Zone is not allowed to be empty",
    "any.required": "Time Zone is required",
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
  company: Joi.string().required().messages({
    "string.empty": "Company is not allowed to be empty",
    "any.required": "Company is required",
  }),
  job_title: Joi.string().required().messages({
    "string.empty": "Job Title is not allowed to be empty",
    "any.required": "Job Title  is required",
  }),

});

export const validateAdminUpdateProfile = (req, res, next) => {
  const { error } = UpdateadminProfile.validate(req.body);

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

const updateAwardCategory = Joi.object({

  awardId:Joi.string().required().messages({
    "string.empty":"award ID is not allowed to be empty",
    "any.required":"award ID is required"
  }),
  category_name:Joi.string().required().messages({
    "string.empty":"Category Name is not allowed to be empty",
    "any.required":"Catgeory Name is required"
  }),
  category_prefix:Joi.string().required().messages({
    "string.empty":"Category Prefix is not allowed to be empty",
    "any.required":"Category Prefix is required"
  }),
  belongs_group:Joi.string().required().messages({
    "string.empty":"Belongs Group is not allowed to be empty",
    "any.required":"Belongs Group is required "
  }),
  limit_submission:Joi.string().required().messages({
    "string.empty":"Limit Submission is not allowed to be empty",
    "any.required":"Limit Submission is required ."
  }),
  is_start_date: Joi.number().valid(0, 1).required().messages({
    'any.only': 'is Start Date must be either 0 or 1',
    'any.required': 'is Start Date field is required',
  }),
  is_end_date: Joi.number().valid(0, 1).required().messages({
    'any.only': 'is End Date must be either 0 or 1',
    'any.required': 'is End Date field is required',
  }),
  is_endorsement:Joi.number().valid(0,1).required().messages({
    "any.only":"isEndorsement must be either 0 or 1",
    "any.required":"isendorsement field is required"
  }),
  start_date: Joi.string().messages({
    'string.empty': "Start date cannot be empty",
    'string.Date': "Start date must be a valid date",
  }),
  end_date: Joi.string().messages({
    'string.empty': "End date cannot be empty",
    'string.Date': "End date must be a valid date",
  }),
})

export const validateAwardCategoryUpdate = (req, res, next) => {
  const { error } = updateAwardCategory.validate(req.body);

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