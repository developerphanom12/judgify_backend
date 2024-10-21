import db from "../database/connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const saltRounds = 10;
import ExcelJS from 'exceljs'
import resposne from "../middleware/resposne.js";
dotenv.config();

export function adminRegister(first_name, last_name, email, password, company, mobile_number, country) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO admin (first_name,last_name, email, password,company, mobile_number,country) 
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
          reject(new Error(resposne.adminfailed));
        }
      }
    });
  });
}

export function checkemail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE email = ?";
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
    const query = "SELECT * FROM admin WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function loginAdmin(email, password) {
  const userQuery = "SELECT * FROM admin WHERE email = ?";

  return new Promise((resolve, reject) => {
    db.query(userQuery, [email], async (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve({ error: resposne.invaliduser });
      }

      const user = results[0];

      if (!password || !user.password) {
        return resolve({ error: resposne.missingPass });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return resolve({ error: resposne.invalidpassword });
      }

      db.query([email], () => {
        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
          },
          process.env.JWT_SECRET
        );
        console.log(token)
        resolve({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
            token: token,
          },
        });
      });
    });
  });
}

export const updateprofile = (updates, userId) => {
  return new Promise((resolve, reject) => {
    const updateFields = [];
    const updateValues = [];

    if (updates.first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(updates.first_name);
    }
    if (updates.last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(updates.last_name);
    }
    if (updates.email) {
      updateFields.push('email = ?');
      updateValues.push(updates.email);
    }
    if (updates.company) {
      updateFields.push('company = ?');
      updateValues.push(updates.company);
    }
    if (updates.mobile_number) {
      updateFields.push('mobile_number = ?');
      updateValues.push(updates.mobile_number);
    }
    if (updates.time_zone) {
      updateFields.push('time_zone = ?');
      updateValues.push(updates.time_zone);
    }
    if (updates.job_title) {
      updateFields.push('job_title = ?');
      updateValues.push(updates.job_title);
    }
    if (updates.imageFilename) {
      updateFields.push('profile_image = ?');
      updateValues.push(updates.imageFilename);
    }

    if (updateFields.length === 0) {
      return reject(new Error(resposne.novalidfield));
    }

    const updateSql = `
      UPDATE admin
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    db.query(updateSql, [...updateValues, userId], (error, result) => {
      if (error) {
        return reject(error);
      }

      if (result.affectedRows > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export function generateOTP() {
  let OTP = "123456";
  return OTP;
}

export function storeOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM admin_otp WHERE email = ?
    `;
    const insertSql = `
      INSERT INTO admin_otp (email, otp)
      VALUES (?, ?)
    `;
    db.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }

      db.query(deleteSql, [email], (error) => {
        if (error) {
          return db.rollback(() => {
            reject(error);
          });
        }

        db.query(insertSql, [email, otp], (error, result) => {
          if (error) {
            return db.rollback(() => {
              reject(error);
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err);
              });
            }

            const successMessage = "OTP sent successfully";
            resolve(successMessage);
          });
        });
      });
    });
  });
}

export function verifyOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT * FROM admin_otp WHERE email = ? AND otp = ?
    `;
    const updateSql = `
      UPDATE admin_otp SET is_verified = 1 WHERE email = ? AND otp = ?
    `;

    db.query(selectSql, [email, otp], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(new Error("Invalid OTP"));
      } else {
        db.query(
          updateSql,
          [email, otp],
          (updateError, updateResult) => {
            if (updateError) {
              reject(updateError);
            } else {
              resolve("OTP verified successfully");
            }
          }
        );
      }
    });
  });
}

export function checkemailOtp(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function changeforgetPassword({ email, newPassword }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM admin_otp WHERE email = ? AND is_verified = 1";
    const updateSql = "UPDATE admin SET password = ? WHERE email = ?";

    db.query(selectSql, [email], async (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return reject(new Error("OTP not verified"));
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

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

export async function createEvent(
  event_name,
  industry_type,
  closing_date,
  closing_time,
  email,
  event_url,
  time_zone,
  additional_email,
  is_endorsement,
  is_withdrawal,
  is_edit_entry,
  limit_submission,
  submission_limit,
  event_logo,
  event_banner,
  event_description
) {
  const insertSql = `
    INSERT INTO event_details (
      event_name, 
      industry_type, 
      closing_date, 
      closing_time, 
      email, 
      event_url, 
      time_zone, 
      additonal_email, 
      is_endorsement, 
      is_withdrawal, 
      is_ediit_entry, 
      limit_submission, 
      event_logo, 
      event_banner, 
      event_description,
      submission_limit
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
  `;

  const values = [
    event_name,
    industry_type,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    additional_email,
    is_endorsement,
    is_withdrawal,
    is_edit_entry,
    limit_submission,
    event_logo,
    event_banner,
    event_description,
    submission_limit
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(insertError);
        }
        if (result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error("Failed to create event"));
        }
      });
    });

    return {
      id: result,
      message: "Event created successfully"
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export function checkeventId(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE id = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function createAward(
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
) {
  const insertSql = `
    INSERT INTO awards_category (
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
  `;

  const values = [
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
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database insert error: ${insertError.message}`));
        }
        if (result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error(resposne.awardcreatefail));
        }
      });
    });

    return {
      id: result,
      message: resposne.awardcreate
    };
  } catch (error) {
    // console.error("Error creating award:", error); 
    throw new Error(`Database error: ${error.message}`);
  }
}

export function getAwards() {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
          a.category_name,
          a.category_prefix,
          a.belongs_group,
          a.limit_submission,
          e.closing_date  
          FROM awards_category a 
          LEFT JOIN event_details e ON a.eventId = e.id
          WHERE a.is_deleted = 0
      `;

    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results.length ? results : []);
    });
  });
}

export function exportToExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Award Category");

  worksheet.columns = [
    { header: "id.", key: "id", width: 5 },
    { header: "EventId.", key: "eventId", width: 12 },
    { header: "Category Name", key: "category_name", width: 20 },
    { header: "Category Prefix", key: "category_prefix", width: 15 },
    { header: "Belongs Group", key: "belongs_group", width: 35 },
    { header: "Limit Submission", key: "limit_submission", width: 35 },
    { header: "Closing Date", key: "closing_date", width: 25 }
  ];

  return new Promise((resolve, reject) => {
    db.connect();
    db.query(`SELECT 
      a.id,
      a.eventId,
      a.category_name,
      a.category_prefix,
      a.belongs_group,
      a.limit_submission,
      e.closing_date  
      FROM awards_category a 
      LEFT JOIN event_details e ON a.eventId = e.id
      WHERE a.is_deleted =0
      `
      , (err, results) => {
        if (err) {
          return reject(err);
        }

        results.forEach((user) => {
          worksheet.addRow({
            id: user.id,
            eventId: user.eventId,
            category_name: user.category_name,
            category_prefix: user.category_prefix,
            belongs_group: user.belongs_group,
            limit_submission: user.limit_submission,
            closing_date: user.closing_date
          });
        });

        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { bold: true };
        });

        workbook.xlsx.writeBuffer()
          .then(buffer => resolve(buffer))
          .catch(err => reject(err));
      });
  });
}

export function getEventDashboard() {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
          event_name,
          event_logo,
          closing_date  
          FROM event_details
          WHERE is_deleted = 0
      `;

    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results.length ? results : []);
    });
  });
};

export async function checkCurrentPass(user, password) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE id = ?";

    if (!password) {
      return resolve({ error: resposne.missingPass });
    }

    db.query(query, [user.id], async (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve({ error: resposne.usernotfound });
      }

      const dbUser = results[0];
      const passwordMatch = await bcrypt.compare(password, dbUser.password);

      if (!passwordMatch) {
        return resolve({ error: resposne.invalidpassword });
      }

      resolve(true);
    });
  });
}

export async function newPasswordd({ userId, currentPassword, newPassword }) {
  const selectSql = "SELECT * FROM admin WHERE id = ?";
  const updateSql = "UPDATE admin SET password = ? WHERE id = ?";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(selectSql, [userId], (err, results) => {
        if (err) return reject(new Error(resposne.errorchangePass));
        resolve(results);
      });
    });

    if (results.length === 0) {
      throw new Error(resposne.usernotfound);
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error(resposne.incorrectcurrentPass);
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updated = await new Promise((resolve, reject) => {
      db.query(updateSql, [hashedPassword, userId], (err, updated) => {
        if (err) return reject(new Error(resposne.updatePassError));
        resolve(updated);
      });
    });

    if (updated.affectedRows === 0) {
      throw new Error(resposne.passUpdateFail);
    }

    return resposne.passChanged;
  } catch (error) {
    console.error("Password change error:", error); 
    throw new Error("An error occurred while changing the password");
  }
}


export function getMyEvents(skip, limit) {

  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM event_details
      WHERE is_deleted = 0
    `;

    db.query(countQuery, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const totalCount = countResults[0].totalCount;

      const query = `
        SELECT 
          event_name,
          closing_date,
          event_logo,
          is_pending,
          is_withdrawn,
          is_completed,
          is_draft
          FROM event_details 
          WHERE is_deleted = 0
          LIMIT ? OFFSET ?
      `;

      db.query(query, [parseInt(limit), parseInt(skip)], (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve({
          totalCount: totalCount,
          events: results.length ? results : [],
        });
      });
    });
  });
}

export function sortbyoldest() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *  
      FROM event_details 
      WHERE is_deleted = 0
      ORDER BY created_at ASC   
    `;

    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
}

export function sortbynewest() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *  
      FROM event_details 
      WHERE is_deleted = 0
      ORDER BY created_at DESC   
    `;

    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
}

export function getMyEventsSorted(skip, limit) {

  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM event_details
    `;

    db.query(countQuery, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const totalCount = countResults[0].totalCount;

      const query = `
        SELECT 
          event_name,
          closing_date,
          event_logo,
          is_pending,
          is_withdrawn,
          is_completed,
          is_draft
        FROM event_details 
        ORDER BY created_at
        LIMIT ? OFFSET ?
      `;

      db.query(query, [parseInt(limit), parseInt(skip)], (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve({
          totalCount: totalCount,
          events: results.length ? results : [],
        });
      });
    });
  });
}

export function searchEvent(search) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM event_details 
      WHERE event_name LIKE ? AND is_deleted = 0`;

    const values = [`%${search}%`];

    db.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

export async function updateAward(
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
) {
  const updateSql = `
    UPDATE awards_category SET
      category_name = ?,
      category_prefix = ?,
      belongs_group = ?,
      limit_submission = ?,
      is_start_date = ?,
      is_end_date = ?,
      is_endorsement = ?,
      start_date = ?,
      end_date = ?
    WHERE id = ?
  `;

  const values = [
    category_name,
    category_prefix,
    belongs_group,
    limit_submission,
    is_start_date,
    is_end_date,
    is_endorsement,
    start_date,
    end_date,
    awardId
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database update error: ${updateError.message}`));
        }
        if (result.affectedRows > 0) {
          resolve({ message: 'Award updated successfully' });
        } else {
          reject(new Error('Award update failed or award not found'));
        }
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to update award: ${error.message}`);
  }
}


export async function softDeleteAward(awardId) {
  const updateSql = "UPDATE awards_category SET is_deleted = 1 WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) return reject(new Error(resposne.deleteAwardError));
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error(resposne.awardNotFound);
    }

    return resposne.awardDeleted;
  } catch (error) {
    throw error;
  }
}

export function checkifDeleted(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_deleted FROM awards_category WHERE id = ?";
    db.query(query, [awardId], (err, results) => {
      if (err) {
        return reject(new Error("Error checking deletion status"));
      }
      if (results.length === 0) {
        return reject(new Error("Award not found"));
      }
      resolve(results[0].is_deleted === 1);
    });
  });
}
