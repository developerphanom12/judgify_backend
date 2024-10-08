const Joi = require("joi");
const { resposne } = require("../Middleware/resposne");

const adminRegister = Joi.object({

  first_name: Joi.string().required().messages({
    "string.empty": "First name is not allowed to be empty",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Last name is not allowed to be empty",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": " Email is not allowed to be Empty",
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi
    .string()
    .min(8)
    .max(16)
    .required().messages({
      "string.empty": " Password is not allowed to be Empty",
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

const validateAdmin = (req, res, next) => {
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
  email: Joi.string().email().messages({
    'string.email': 'Email must be a valid email address',
    'string.required': 'Email is required',
  }),
  password: Joi
    .string()
    .min(8)
    .max(16)
    .required().messages({
      "string.empty": " password is not allowed to be Empty",
      "any.required": "password is required",
    }),
});

const validateAdminLogin = (req, res, next) => {
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

module.exports = {
  validateAdmin, validateAdminLogin,
};
