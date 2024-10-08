const db = require("../Database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { resposne } = require('../Middleware/resposne')
dotenv.config();

const adminRegister = async ({
  first_name,
  last_name,
  email,
  password,
  company,
  mobile_number,
  country }) => {
  return new Promise((resolve, reject) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = `
    INSERT INTO admin (
    first_name,
    last_name,
    email  ,
    password ,
    company  ,
    mobile_number,
    country 
   ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
      first_name,
      last_name,
      email,
      hashedPassword,
      company,
      mobile_number,
      country
    ], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

function checkEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length === 0);
      }
    });
  });
}
function checkMobile(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length === 0);
      }
    });
  });
}


async function loginadmin(email, password, callback) {
  try {
    const query = "SELECT * FROM admin WHERE email = ?";
    const results = await new Promise((resolve, reject) => {
      db.query(query, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (results.length === 0) {
      return callback(null, { error: "Invalid user" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return callback(null, { error: "Invalid password" });
    }

    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      secretKey,
    );

    console.log("Generated Token:", token);

    return callback(null, {
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (err) {
    console.error("Error in login process:", err);
    return callback(err, null);
  }
}


module.exports = {
  adminRegister,
  checkEmail,
  checkMobile,
  loginadmin,

};
