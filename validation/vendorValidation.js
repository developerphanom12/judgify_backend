const Joi = require("joi");

const vendoregister = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is not  empty",
    "any.required": "Name is required",

  }),
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits long",
      "string.pattern.base":
      "Mobile number must start with digits 6-9 and contain only digits",
      "any.required": "Mobile number is required",
      "string.empty": "Mobile number is not empty",
      "any.empty": "Mobile number is  not empty",

    }),
  email: Joi.string().email().optional().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().max(16).min(8).required().messages({
    "string.max": "Password must be at most 16 characters long",
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
    "string.empty" : "Password is not empty"
  }),
  longitude: Joi.string().required().messages({
    "string.empty": "longitude is not empty",
    "any.required": "longitude is required",
  }),
  latitude: Joi.string().required().messages({
    "string.empty": "latitude is not empty",
    "any.required": "latitude is required",
    
  }),
  address: Joi.string().required().messages({
    "string.empty": "address is not empty",
    "any.required": "Address is required",
  })

});

const validateVendor = (req, res, next) => {
  const { error } = vendoregister.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }

  next();
};

const vendorOtp = Joi.object({
 mobile_number: Joi.string()
    .length(10)
    .pattern(/^[6-9]{1}[0-9]{9}$/)
    .required()
    .messages({
      'string.length': 'Mobile number must be exactly 10 digits long',
      'string.pattern.base': 'Mobile number must start with a digit between 6 and 9 and be followed by 9 digits',
      'any.required': 'Mobile number is required',
      "string.empty": "Mobile number is not empty",
      "any.empty": "Mobile number is  not empty",

    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits long",
      "string.pattern.base":
        "OTP must be exactly 6 digits consisting of numbers only",
      "any.required": "OTP is required",
      "string.empty": "OTP is not empty",
    }),
});

const vendorOtpVerify = (req, res, next) => {
  const { error } = vendorOtp.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }

  next();
};

const validateotpVendor = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits long",
      "string.pattern.base":
        "Mobile number must start with a digit between 6 and 9 and be followed by 9 digits",
      "any.required": "Mobile number is required",
      "string.empty": "Mobile number is not empty",
    }),
});

const vendorValidatesendotp = (req, res, next) => {
  const { error } = validateotpVendor.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }

  next();
};

const vendorForgetOtp = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/^[6-9]{1}[0-9]{9}$/)
    .required()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits long",
      "string.pattern.base":
        "Mobile number must start with a digit between 6 and 9 and be followed by 9 digits",
      "any.required": "Mobile number is required",
      "string.empty": "Mobile number is not empty",
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits long",
      "string.pattern.base":
        "OTP must be exactly 6 digits consisting of numbers only",
      "any.required": "OTP is required",
      "string.empty": "Otp is not empty",
    }),
});

const VendorForgetVerify = (req, res, next) => {
  const { error } = vendorForgetOtp.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }

  next();
};

const vendorChangePass = Joi.object({
  mobile_number: Joi.string()
    .length(10)
    .pattern(/^[6-9]{1}[0-9]{9}$/)
    .required()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits long",
      "string.pattern.base":
        "Mobile number must start with a digit between 6 and 9 and be followed by 9 digits",
      "any.required": "Mobile number is required",
      "string.empty": "Mobile number is not empty",
    }),
  password: Joi.string().max(16).min(8).required().messages({
    "string.max": "Password must not exceed 16 characters",
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
    "string.empty": "Password  is not empty",
  }),
});

const validatevendorPass = (req, res, next) => {
  const { error } = vendorChangePass.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ status: false, message: error.details[0].message });
  }

  next();
};



const ValidateServiceselectBYvendor = (req, res, next) => {
  const { error } = vendorserviceselect.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};


const vendordocumentSchema = Joi.object({
  adarfrontend: Joi.object().required().messages({
    'any.required': 'Aadhaar Front Image is required',
    'object.base': 'adar frontend  image required',
  }),
  adarback: Joi.object().required().messages({
    'any.required': 'Aadhaar Back Image is required',
    'object.base': 'adar back  image required',

  }),
  licfront: Joi.object().required().messages({
    'any.required': 'License Front Image is required',
    'object.base': 'License Front  image required',
  }),
  licback: Joi.object().required().messages({
    'any.required': 'License Back Image is required',
    'object.base': 'License Back  image required',
  }),
});

const ValidateDocuments = (req, res, next) => {
  const { files } = req;
  
  if (!files || !files.adarfrontend || !files.adarback || !files.licfront || !files.licback) {
    return res.status(400).json({ 
      status: false, 
      message: "All license and Aadhaar card images are required" 
    });
  }

  next();
};



const bankDetailsSchema = Joi.object({
  bank_holder: Joi.string()
      .min(2)
      .max(255)
      .required()
      .messages({
          'string.empty': 'Bank holder name is not empty.',
          'string.min': 'Bank holder name must be at least 2 characters long.',
          'string.max': 'Bank holder name must be less than or equal to 255 characters.',
          'any.required':"Bank holder name is required."
      }),
      
  account_number: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(6)
      .max(20)
      .required()
      .messages({
          'string.empty': 'Account number is not empty.',
          'string.pattern.base': 'Account number must contain only digits.',
          'string.min': 'Account number must be at least 6 digits long.',
          'string.max': 'Account number must be less than or equal to 20 digits.',
          'any.required':"Account number  is required."

      }),
      
  bank_name: Joi.string()
      .min(2)
      .max(255)
      .required()
      .messages({
          'string.empty': 'Bank name  is not empty..',
          'string.min': 'Bank name must be at least 2 characters long.',
          'string.max': 'Bank name must be less than or equal to 255 characters.',
          'any.required':"Bank name  is required."

      }),
      
  ifsc_code: Joi.string()
      .required()
      .messages({
          'string.empty': 'IFSC code is not empty.',
          'string.pattern.base': 'IFSC code is valid format (e.g., ABCD0123456).',
          'any.required':"IFSC code  is required."
      }),
});



const ValidateBankDetails = (req, res, next) => {
  const { error } = bankDetailsSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  next();
};

module.exports = {
  validateVendor,
  vendorOtpVerify,
  vendorValidatesendotp,
  VendorForgetVerify,
  validatevendorPass,
  ValidateServiceselectBYvendor,
  ValidateDocuments,
  ValidateBankDetails
};
