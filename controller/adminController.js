const saltRounds = 10;
const bcrypt = require("bcrypt");
const adminService = require("../service/adminService");
const { resposne } = require("../Middleware/resposne");
const path = require("path");

const registerAdmin = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      company,
      mobile_number,
      country } = req.body;

    const emailExists = await adminService.checkEmail(email);
    if (!emailExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.checkusername
      });
    }
    const mobileExists = await adminService.checkMobile(mobile_number);
    if (!mobileExists) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.checkusername
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const admin = await adminService.adminRegister({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      company,
      mobile_number,
      country
    });

    if (admin) {
      res.status(200).json({
        status: resposne.successTrue,
        message: resposne.usercreate,
      });
    } else {
      res.status(400).json({
        status: resposne.successTrue,
        message: resposne.userfailed,
      });
    }
  } catch (error) {
    console.error("Error during admin registration:", error);
    res.status(400).json({
      status: resposne.successFalse,
      message: resposne.internalerror,
    });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const emailExists = await adminService.checkEmail(email);
  if (!emailExists) {  
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.emailnotexist,
    });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      adminService.loginadmin(email, password, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    if (result.error) {
      console.error("Login error:", result.error);
            return res.status(400).json({
        
        status: resposne.successFalse,
        message: resposne.loginuser,  
        error: result.error,
      });
    }    
    else {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.lginmessage,  
        data: result.data,
      });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({
      status: resposne.successFalse,
      message: resposne.internalerror,  
    });
  }
};



module.exports = {
  registerAdmin,
  loginAdmin,

};
