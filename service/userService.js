import db from "../database/connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const saltRounds = 10;
import resposne from "../middleware/resposne.js";
dotenv.config();

export function userRegister(first_name, last_name, email, password, company, mobile_number, country) {
  return new Promise((resolve, reject) => {
    const insertSql = `
        INSERT INTO user (first_name,last_name, email, password,company, mobile_number,country) 
        VALUES (?, ?, ?, ?, ?, ? ,?)
      `;

    const values = [first_name, last_name, email, password, company, mobile_number, country];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const userId = result.insertId;
        if (userId) {
          resolve(userId);
        } else {
          reject(new Error(resposne.userfailed));
        }
      }
    });
  });
}

export function checkemail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkphone(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function loginUser(email, password) {
  const userQuery = "SELECT * FROM user WHERE email = ?";

  return new Promise((resolve, reject) => {
    db.query(userQuery, [email], async (err, results) => {
      if (err) {
        // console.error("Database error:", err);
        return reject(err);
      }

      if (results.length === 0) {
        const error = { error: resposne.invaliduser };
        // console.error("Invalid user:", error);
        return resolve(error);
      }

      const user = results[0];

      if (!password || !user.password) {
        const error = { error: resposne.missingPass };
        // console.error("Missing password:", error);
        return resolve(error);
      }

      try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          const error = { error: resposne.invalidpassword };
          // console.error("Invalid password:", error);
          return resolve(error);
        }

        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
          },
          process.env.JWT_SECRET,
        );

        resolve({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
          },
        });
      } catch (err) {
        // console.error("Error during password comparison:", err);
        return reject(err);
      }
    });
  });
}

export function generateOTP() {
  let OTP = "123456";
  return OTP;
}

export function storeOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM user_otp WHERE email = ?
    `
    const insertSql = `
      INSERT INTO user_otp (email, otp)
      VALUES (?, ?)
    `
    db.beginTransaction((err) => {
      if (err) {
        return reject(err)
      }

      db.query(deleteSql, [email], (error) => {
        if (error) {
          return db.rollback(() => {
            reject(error)
          })
        }

        db.query(insertSql, [email, otp], (error, result) => {
          if (error) {
            return db.rollback(() => {
              reject(error)
            })
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err)
              })
            }

            const successMessage = resposne.otpsend
            resolve(successMessage)
          })
        })
      })
    })
  })
}

export function verifyOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT * FROM user_otp WHERE email = ? AND otp = ?
    `
    const updateSql = `
      UPDATE user_otp SET is_verified = 1 WHERE email = ? AND otp = ?
    `

    db.query(selectSql, [email, otp], (error, results) => {
      if (error) {
        reject(error)
      } else if (results.length === 0) {
        reject(new Error(resposne.invalidOtp))
      } else {
        db.query(
          updateSql,
          [email, otp],
          (updateError, updateResult) => {
            if (updateError) {
              reject(updateError)
            } else {
              resolve(resposne.otpverified)
            }
          }
        )
      }
    })
  })
}

export function checkemailOtp(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user_otp WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function changePassword({ email, password }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM user_otp WHERE email = ? AND is_verified = 1";
    const updateSql = "UPDATE user SET password = ? WHERE email = ?";

    db.query(selectSql, [email], async (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return reject(new Error("OTP not verified"));
      }

      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.query(updateSql, [hashedPassword, email], (updateError) => {
          if (updateError) {
            return reject(updateError);
          }

          resolve("Password changed successfully");
        });
      } catch (hashError) {
        reject(hashError);
      }
    });
  });
}

export async function changeforgetPassword({ email, newPassword }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM user_otp WHERE email = ? AND is_verified = 1"
    const updateSql = "UPDATE user SET password = ? WHERE email = ?"

    db.query(selectSql, [email], async (error, results) => {
      if (error) {
        return reject(error)
      }

      if (results.length === 0) {
        return reject(new Error(resposne.otpnotverified))
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

        db.query(updateSql, [hashedPassword, email], (updateError) => {
          if (updateError) {
            return reject(updateError)
          }

          resolve(resposne.passChanged)
        })
      } catch (hashError) {
        reject(hashError)
      }
    })
  })
}


export function checkeventId(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE id = ?"
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results.length > 0 ? true : false)
      }
    })
  })
}

export async function getCouponCodes(eventId) {

  const query = `
      SELECT 
      coupon_code
      FROM coupons 
      WHERE is_deleted = 0 AND eventId = ?
    `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [eventId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    return {
      CouponCodes: results.length ? results : [],
    };
  } catch (err) {
    throw new Error(`Error fetching coupon codes: ${err.message}`);
  }
}
