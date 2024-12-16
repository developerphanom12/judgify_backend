import db from "../database/connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
const saltRounds = 10
import ExcelJS from 'exceljs'
import resposne from "../middleware/resposne.js"
import { resolve } from "path"
import { error } from "console"
dotenv.config()

export function adminRegister(
  first_name,
  last_name,
  email,
  password,
  company,
  mobile_number,
  country) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO admin (first_name,last_name, email, password,company, mobile_number,country) 
      VALUES (?, ?, ?, ?, ?, ? ,?)
    `

    const values = [first_name, last_name, email, password, company, mobile_number, country]

    db.query(insertSql, values, (error, result) => {
      if (error) {
        reject(error)
      } else {
        const userId = result.insertId
        if (userId) {
          resolve(userId)
        } else {
          reject(new Error(resposne.adminfailed))
        }
      }
    })
  })
}

export function checkemail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE email = ?"
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results.length > 0 ? true : false)
      }
    })
  })
}

export function checkphone(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE mobile_number = ?"
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results.length > 0 ? true : false)
      }
    })
  })
}

export function loginAdmin(email, password) {
  const userQuery = "SELECT * FROM admin WHERE email = ?"

  return new Promise((resolve, reject) => {
    db.query(userQuery, [email], async (err, results) => {
      if (err) {
        return reject(err)
      }

      if (results.length === 0) {
        return resolve({ error: resposne.invaliduser })
      }

      const user = results[0]

      if (!password || !user.password) {
        return resolve({ error: resposne.missingPass })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return resolve({ error: resposne.invalidpassword })
      }

      db.query([email], () => {
        const token = jwt.sign(
          {
            id: user.id,
            first_name: user.first_name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
          },
          process.env.JWT_SECRET
        )
        console.log(token)
        resolve({
          data: {
            id: user.id,
            first_name: user.first_name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
            token: token,
          },
        })
      })
    })
  })
}

export const updateprofile = (updates, userId) => {
  return new Promise((resolve, reject) => {
    const updateFields = []
    const updateValues = []

    if (updates.first_name) {
      updateFields.push('first_name = ?')
      updateValues.push(updates.first_name)
    }
    if (updates.last_name) {
      updateFields.push('last_name = ?')
      updateValues.push(updates.last_name)
    }
    if (updates.email) {
      updateFields.push('email = ?')
      updateValues.push(updates.email)
    }
    if (updates.company) {
      updateFields.push('company = ?')
      updateValues.push(updates.company)
    }
    if (updates.mobile_number) {
      updateFields.push('mobile_number = ?')
      updateValues.push(updates.mobile_number)
    }
    if (updates.time_zone) {
      updateFields.push('time_zone = ?')
      updateValues.push(updates.time_zone)
    }
    if (updates.job_title) {
      updateFields.push('job_title = ?')
      updateValues.push(updates.job_title)
    }
    if (updates.imageFilename) {
      updateFields.push('profile_image = ?')
      updateValues.push(updates.imageFilename)
    }

    if (updateFields.length === 0) {
      return reject(new Error(resposne.novalidfield))
    }

    const updateSql = `
      UPDATE admin
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    db.query(updateSql, [...updateValues, userId], (error, result) => {
      if (error) {
        return reject(error)
      }

      if (result.affectedRows > 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

export function generateOTP() {
  let OTP = "123456"
  return OTP
}

export function storeOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM admin_otp WHERE email = ?
    `
    const insertSql = `
      INSERT INTO admin_otp (email, otp)
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
      SELECT * FROM admin_otp WHERE email = ? AND otp = ?
    `
    const updateSql = `
      UPDATE admin_otp SET is_verified = 1 WHERE email = ? AND otp = ?
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
    const query = "SELECT * FROM admin WHERE email = ?"
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results.length > 0 ? true : false)
      }
    })
  })
}

export async function changeforgetPassword({ email, newPassword }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM admin_otp WHERE email = ? AND is_verified = 1"
    const updateSql = "UPDATE admin SET password = ? WHERE email = ?"

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

export function checkeventEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        return reject(new Error("Database query error while checking event's email"));
      }
      resolve(results.length > 0);
    });
  });
}

export function checkAdmin(adminId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE id = ?";
    db.query(query, [adminId], (err, results) => {
      if (err) {
        return reject(new Error("Database query error while checking admin"));
      }
      resolve(results.length > 0);
    });
  });
}

export async function createEvent(
  adminId,
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
  event_logo,
  event_banner,
  event_description
) {
  const insertSql = `
      INSERT INTO event_details (
        adminId, 
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
        event_logo, 
        event_banner, 
        event_description,
        submission_limit
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    adminId,
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
    event_logo,
    event_banner,
    event_description,
    submission_limit
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Error inserting event: ${insertError.message}`));
        }
        if (result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error("Event creation failed: No insert ID"));
        }
      });
    });

    return {
      id: result,
      inserId:result.insertId,
      message: resposne.createvent, // Assuming response is defined elsewhere
    };
  } catch (error) {
    console.log("Error in createEvent:", error);
    throw new Error(`Database error: ${error.message}`);
  }
}


export function additional_emailssss(eventId, additionalEmails) {
  return new Promise((resolve, reject) => {
    // Validate that additionalEmails is an array
    if (!Array.isArray(additionalEmails)) {
      const error = new Error("additionalEmails must be an array");
      console.log("Error in additional_emailssss: ", error.message);
      return reject(error);  // Reject the promise if the data is invalid
    }

    const insertSql = `INSERT INTO additional_emails (eventId, additonal_email) VALUES (?, ?)`;
    const queries = additionalEmails.map((email) => {
      return new Promise((res, rej) => {
        db.query(insertSql, [eventId, email], (error, result) => {
          if (error) {
            console.log("Error inserting additional email:", error);
            rej(error);
          } else {
            res(result.insertId);
          }
        });
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => reject(error));
  });
}

export function industry_types(eventId, industryTypes) {
  return new Promise((resolve, reject) => {
    // Validate that industryTypes is an array
    if (!Array.isArray(industryTypes)) {
      const error = new Error("industryTypes must be an array");
      console.log("Error in industry_types: ", error.message);
      return reject(error);  // Reject the promise if the data is invalid
    }

    const insertSql = `INSERT INTO industry_types (eventId, industry_type) VALUES (?, ?)`;
    const queries = industryTypes.map((industryType) => {
      return new Promise((res, rej) => {
        db.query(insertSql, [eventId, industryType], (error, result) => {
          if (error) {
            console.log("Error inserting industry type:", error);
            rej(error);
          } else {
            res(result.insertId);
          }
        });
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => {
        console.log("Error inserting industry types:", error);
        reject(error);
      });
  });
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
  `

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
  ]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database insert error: ${insertError.message}`))
        }
        if (result.insertId) {
          resolve(result.insertId)
        } else {
          reject(new Error(resposne.awardcreatefail))
        }
      })
    })

    return {
      id: result,
      message: resposne.awardcreate
    }
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

export function getAwards(eventId, search, sortOrder = 'newest') {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        a.id AS awardId,
        a.category_name,
        a.category_prefix,
        a.belongs_group,
        a.limit_submission,
        e.id AS eventId,
        e.closing_date 
      FROM awards_category a 
      LEFT JOIN event_details e ON a.eventId = e.id  
      WHERE a.is_deleted = 0 AND a.eventId = ?`;

    if (search) {
      query += ` AND a.category_name LIKE ?`;
    }

    if (sortOrder === 'newest') {
      query += ` ORDER BY a.created_at DESC`; // Newest first
    } else if (sortOrder === 'oldest') {
      query += ` ORDER BY a.created_at ASC`; // Oldest first
    }

    const searchTerm = search ? `%${search}%` : null;

    db.query(query, [eventId, searchTerm].filter(Boolean), (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results.length > 0 ? results : []);
    });
  });
}

// export function exportToExcel(eventId) {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Award Category");

//   worksheet.columns = [
//     { header: "ID", key: "id", width: 5 },
//     { header: "Event ID", key: "eventId", width: 12 },
//     { header: "Category Name", key: "category_name", width: 20 },
//     { header: "Category Prefix", key: "category_prefix", width: 15 },
//     { header: "Belongs Group", key: "belongs_group", width: 35 },
//     { header: "Limit Submission", key: "limit_submission", width: 35 },
//     { header: "Closing Date", key: "closing_date", width: 25 },
//   ];

//   return new Promise((resolve, reject) => {
//     const sql = `
//       SELECT 
//         a.id,
//         a.eventId,
//         a.category_name,
//         a.category_prefix,
//         a.belongs_group,
//         a.limit_submission,
//         e.closing_date  
//       FROM awards_category a 
//       LEFT JOIN event_details e ON a.eventId = e.id
//       WHERE e.id = ?
//       `;

//     // console.log('Executing SQL:', sql);
//     // console.log('With parameters:', [eventId]);

//     db.query(sql, [eventId], (err, results) => {
//       if (err) {
//         // console.error('SQL Error:', err);
//         return reject(err);
//       }

//       // console.log('Query Results:', results);

//       results.forEach((row) => {
//         worksheet.addRow({
//           id: row.id,
//           eventId: row.eventId,
//           category_name: row.category_name,
//           category_prefix: row.category_prefix,
//           belongs_group: row.belongs_group,
//           limit_submission: row.limit_submission,
//           closing_date: row.closing_date,
//         });
//       });

//       worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
//         cell.font = { bold: true };
//       });

//       workbook.xlsx.writeBuffer()
//         .then((buffer) => {
//           resolve(buffer);
//         })
//         .catch((writeErr) => {
//           console.error('Error writing workbook:', writeErr);
//           reject(writeErr);
//         });
//     });
//   });
// }



export const exportToExcel = async (eventId) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
        a.id,
        a.eventId,
        a.category_name,
        a.category_prefix,
        a.belongs_group,
        a.limit_submission,
        e.closing_date  
      FROM awards_category a 
      LEFT JOIN event_details e ON a.eventId = e.id
      WHERE e.id = ?
      `;

      db.query(query,[eventId], (err, results) => {
        if (err) {
          console.error("Error executing query:", err.message);
          return reject(err);
        }
        resolve(results);
      });
    } catch (error) {
      console.error("Error in getProductsData function:", error.message);
      reject(error);
    }
  });
};


export function getEventDashboard(skip, limit, id, sortOrder ) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        id,
        event_name,
        event_logo,
        closing_date
      FROM event_details
      WHERE adminId = ?
    `;
    
    if (sortOrder === 'newest') {
      query += ` ORDER BY created_at DESC`; 
    } else if (sortOrder === 'oldest') {
      query += ` ORDER BY created_at ASC`; 
    }

    query += ` LIMIT ? OFFSET ?`;

    const queryParams = [id, parseInt(limit), parseInt(skip)];

    db.query(query, queryParams, (err, results) => {
      if (err) {
        return reject(err); 
      }

      resolve(results.length ? results : []);
    });
  });
}


export async function checkCurrentPass(userId, password) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE id = ?"

    db.query(query, [userId], async (err, results) => {
      if (err) {
        return reject(err)
      }

      if (results.length === 0) {
        return resolve({ error: resposne.usernotfound })
      }

      const dbUser = results[0]
      const passwordMatch = await bcrypt.compare(password, dbUser.password)

      if (!passwordMatch) {
        return resolve({ error: resposne.invalidpassword })
      }

      resolve(true)
    })
  })
}

export async function newPasswordd({ userId, currentPassword, newPassword }) {
  const selectSql = "SELECT * FROM admin WHERE id = ?"
  const updateSql = "UPDATE admin SET password = ? WHERE id = ?"

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(selectSql, [userId], (err, results) => {
        if (err) return reject(new Error(resposne.errorchangePass))
        resolve(results)
      })
    })

    if (results.length === 0) {
      throw new Error(resposne.usernotfound)
    }

    const user = results[0]

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      throw new Error(resposne.incorrectcurrentPass)
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    const updated = await new Promise((resolve, reject) => {
      db.query(updateSql, [hashedPassword, userId], (err, updated) => {
        if (err) return reject(new Error(resposne.updatePassError))
        resolve(updated)
      })
    })

    if (updated.affectedRows === 0) {
      throw new Error(resposne.passUpdateFail)
    }

    return resposne.passChanged
  } catch (error) {
    throw new Error(resposne.errorchangePass)
  }
}

export function getMyEvents(skip, limit, id, sortOrder = 'oldest') {
  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM event_details
      WHERE is_deleted = 0
      ${id ? 'AND adminId = ?' : ''}
    `;

    db.query(countQuery, id ? [id] : [], (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const totalCount = countResults[0].totalCount;

      let query = `
        SELECT 
          a.id,
          a.event_name,
          a.closing_date,
          a.event_logo,
          a.is_pending,
          a.is_withdrawn,
          a.is_completed,
          a.is_draft
        FROM event_details a
        WHERE a.is_deleted = 0
        ${id ? 'AND a.adminId = ?' : ''}
      `;

      if (sortOrder === 'newest') {
        query += ` ORDER BY a.created_at ASC`;
      } else if (sortOrder === 'oldest') {
        query += ` ORDER BY a.created_at  DESC`;
      }

      query += ` LIMIT ? OFFSET ?`;

      const queryParams = id
        ? [id, parseInt(limit), parseInt(skip)]
        : [parseInt(limit), parseInt(skip)];

      db.query(query, queryParams, (err, results) => {
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

export async function updateAward(awardId, updates) {
  let updateFields = [];
  let updateValues = [];

  const fields = [
    'category_name',
    'category_prefix',
    'belongs_group',
    'limit_submission',
    'is_start_date',
    'is_end_date',
    'is_endorsement',
    'start_date',
    'end_date'
  ];

  fields.forEach(field => {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(updates[field]);
    }
  });

  updateValues.push(awardId);

  if (updateFields.length === 0) {
    return Promise.reject({
      message: "No valid fields to update",
    });
  }

  const updateSql = `
    UPDATE awards_category
    SET ${updateFields.join(', ')}
    WHERE id = ?
  `;

  // console.log("SQL Query:", updateSql);
  // console.log("Values:", updateValues);

  return new Promise((resolve, reject) => {
    db.query(updateSql, updateValues, (updateError, result) => {
      if (updateError) {
        console.error("Update Error:", updateError);
        return reject({
          message: "Failed to update award",
          error: updateError,
        });
      }

      if (result.affectedRows === 0) {
        return reject({
          message: "No award found with the given ID",
          awardId: awardId,
        });
      }

      resolve({
        message: "Award updated successfully",
      });
    });

  });
}

export async function EmptyStartDate(awardId) {
  const updateSql = "UPDATE awards_category SET start_date = NULL WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) {
          return reject(new Error("Failed to nullify start date"));
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error("No affected rows.");
    }

    return "Start date nullified successfully";
  } catch (error) {
    throw error;
  }
}

export async function EmptyEndDate(awardId) {
  const updateSql = "UPDATE awards_category SET end_date = NULL WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) {
          return reject(new Error("Failed to nullify end date"));
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error("No affected rows.");
    }

    return "End date nullified successfully";
  } catch (error) {
    throw error;
  }
}

export async function softDeleteAward(awardId) {
  const updateSql = "UPDATE awards_category SET is_deleted = 1 WHERE id = ?"

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) return reject(new Error(resposne.deleteAwardError))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.awardNotFound)
    }

    return resposne.awardDeleted
  } catch (error) {
    throw error
  }
}

export function checkifDeleted(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_deleted FROM awards_category WHERE id = ?";
    db.query(query, [awardId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck));
      }
      if (results.length === 0) {
        return reject(new Error("Award not found"));
      }

      const isDeleted = results[0].is_deleted === 1;
      resolve(isDeleted);
    });
  });
}

export async function getEventById(eventId) {
  const selectSql = `
    SELECT 
      ed.id,
      ed.event_name, 
      ed.closing_date,
      ed.closing_time,
      ed.email,
      ed.event_url,
      ed.time_zone,
      ed.is_endorsement,
      ed.is_withdrawal,
      ed.is_ediit_entry,  
      ed.limit_submission,
      ed.submission_limit,
      ed.event_logo,
      ed.event_banner,
      ed.event_description,
      ae.id AS email_id,
      ae.additonal_email AS email_address,  
      it.id AS industry_type_id,
      it.industry_type AS industry_type_name
    FROM event_details ed
    LEFT JOIN industry_types it ON ed.id = it.eventId
    LEFT JOIN additional_emails ae ON ed.id = ae.eventId
    WHERE ed.id = ?  
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [eventId], (fetchError, results) => {
        if (fetchError) {
          return reject(fetchError);
        }

        if (results.length > 0) {
          const event = {
            id: results[0].id,
            event_name: results[0].event_name,
            closing_date: results[0].closing_date,
            closing_time: results[0].closing_time,
            email: results[0].email,
            event_url: results[0].event_url,
            time_zone: results[0].time_zone,
            is_endorsement: results[0].is_endorsement,
            is_withdrawal: results[0].is_withdrawal,
            is_ediit_entry: results[0].is_ediit_entry,
            limit_submission: results[0].limit_submission,
            submission_limit: results[0].submission_limit,
            event_logo: results[0].event_logo,
            event_banner: results[0].event_banner,
            event_description: results[0].event_description,
            additional_emails: [],
            industry_types: []
          };

          results.forEach(row => {
            if (row.email_id && row.email_address) {
              event.additional_emails.push({
                email_id: row.email_id,
                email_address: row.email_address
              });
            }

            if (row.industry_type_id && row.industry_type_name) {
              event.industry_types.push({
                industry_type_id: row.industry_type_id,
                industry_type_name: row.industry_type_name
              });
            }
          });

          resolve(event);
        } else {
          reject(new Error('Event not found'));
        }
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export const deleteIndustryTypes = async (eventId) => {
  return new Promise((resolve, reject) => {
    const deleteQuery = "DELETE FROM industry_types WHERE eventId = ?"
    db.query(deleteQuery, [eventId], (deleteError, result) => {
      if (deleteError) {
        return reject(deleteError)
      }
      resolve(result)
    })
  })
}

export const updateEventDetails = async (eventId, updates) => {
  // Building the SET clause dynamically
  let setClauses = [];
  let values = [];

  // Only add fields that are provided
  if (updates.event_name !== undefined) {
    setClauses.push("event_name = ?");
    values.push(updates.event_name);
  }
  if (updates.closing_date !== undefined) {
    setClauses.push("closing_date = ?");
    values.push(updates.closing_date);
  }
  if (updates.closing_time !== undefined) {
    setClauses.push("closing_time = ?");
    values.push(updates.closing_time);
  }
  if (updates.email !== undefined) {
    setClauses.push("email = ?");
    values.push(updates.email);
  }
  if (updates.event_url !== undefined) {
    setClauses.push("event_url = ?");
    values.push(updates.event_url);
  }
  if (updates.time_zone !== undefined) {
    setClauses.push("time_zone = ?");
    values.push(updates.time_zone);
  }
  if (updates.is_endorsement !== undefined) {
    setClauses.push("is_endorsement = ?");
    values.push(updates.is_endorsement);
  }
  if (updates.is_withdrawal !== undefined) {
    setClauses.push("is_withdrawal = ?");
    values.push(updates.is_withdrawal);
  }
  if (updates.is_ediit_entry !== undefined) {
    setClauses.push("is_ediit_entry = ?");
    values.push(updates.is_ediit_entry);
  }
  if (updates.limit_submission !== undefined) {
    setClauses.push("limit_submission = ?");
    values.push(updates.limit_submission);
  }
  if (updates.submission_limit !== undefined) {
    setClauses.push("submission_limit = ?");
    values.push(updates.submission_limit);
  }

  values.push(eventId);

  if (setClauses.length === 0) {
    return Promise.reject({
      message: "No valid fields to update",
    });
  }

  const updateSql = `
    UPDATE event_details
    SET ${setClauses.join(', ')}
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(updateSql, values, (updateError, result) => {
      if (updateError) {
        console.error("Event Update Error:", updateError);
        return reject({
          message: "Failed to update event details",
          error: updateError,
        });
      }

      if (result.affectedRows === 0) {
        return reject({
          message: "No event found with the given ID",
          eventId: eventId,
        });
      }

      resolve(result);
    });
  });
};


export const deleteAdditionalEmails = async (eventId) => {
  return new Promise((resolve, reject) => {
    const deleteQuery = "DELETE FROM additional_emails WHERE eventId = ?"
    db.query(deleteQuery, [eventId], (deleteError, result) => {
      if (deleteError) {
        return reject(deleteError)
      }
      resolve(result)
    })
  })
}

export const updateAdditionalEmails = async (eventId, additionalEmails) => {
  const emails = Array.isArray(additionalEmails) ? additionalEmails : [additionalEmails];

  if (emails.length === 0) {
    return Promise.reject(new Error("No valid additional emails to update"));
  }

  let setClauses = [];
  let values = [];

  emails.forEach(email => {
    setClauses.push("additonal_email = ?");
    values.push(email);
  });

  values.push(eventId);

  if (setClauses.length === 0) {
    return Promise.reject(new Error("No valid additional emails to update"));
  }

  const updateSql = `
    UPDATE additional_emails
    SET ${setClauses.join(', ')}
    WHERE eventId = ? AND additonal_email IN (?${',?'.repeat(emails.length - 1)})
  `;

  return new Promise((resolve, reject) => {
    db.query(updateSql, [...values, ...emails], (updateErr, updateResult) => {
      if (updateErr) {
        return reject({
          message: "Failed to update additional emails",
          error: updateErr,
        });
      }

      if (updateResult.affectedRows === 0) {
        return reject({
          message: "No matching emails found to update",
          eventId: eventId,
        });
      }

      resolve({
        status: 'updated',
        updatedEmails: emails,
      });
    });
  });
};
export const updateIndustryTypes = async (eventId, industryTypes) => {
  const types = Array.isArray(industryTypes) ? industryTypes : [industryTypes];

  // Early exit if no valid types are provided
  if (types.length === 0) {
    return Promise.reject(new Error("No valid industry types to update"));
  }

  let setClauses = [];
  let values = [];

  // Build the SET clauses and values for industry types
  types.forEach(industryType => {
    setClauses.push("industry_type = ?");
    values.push(industryType);
  });

  values.push(eventId);

  // If no valid industry types were provided, reject with error
  if (setClauses.length === 0) {
    return Promise.reject(new Error("No valid industry types to update"));
  }

  const updateSql = `
    UPDATE industry_types
    SET ${setClauses.join(', ')}
    WHERE eventId = ? AND industry_type IN (?${',?'.repeat(types.length - 1)})
  `;

  return new Promise((resolve, reject) => {
    db.query(updateSql, [...values, ...types], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Industry Type Update Error:", updateErr);
        return reject({
          message: "Failed to update industry types",
          error: updateErr
        });
      }

      if (updateResult.affectedRows === 0) {
        console.warn(`No matching industry types found to update for eventId ${eventId}`);
        return reject({
          message: "No matching industry types found to update",
          eventId: eventId
        });
      }

      resolve({
        status: 'updated',
        updatedIndustryTypes: types
      });
    });
  });
};


export const updateEventSocial = (updates, eventId) => {
  return new Promise((resolve, reject) => {
    const updateFields = []
    const updateValues = []

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return reject(new Error('Invalid event ID.'))
    }

    const checkEventQuery = 'SELECT * FROM event_details WHERE id = ?'
    db.query(checkEventQuery, [eventId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) {
        return reject(new Error('Event not found.'))
      }

      if (updates.imageFilename) {
        updateFields.push('event_logo = ?')
        updateValues.push(updates.imageFilename)
      }

      if (updates.event_banner) {
        updateFields.push('event_banner = ?')
        updateValues.push(updates.event_banner)
      }

      if (updates.event_description) {
        updateFields.push('event_description = ?')
        updateValues.push(updates.event_description)
      }

      if (updates.closing_messsage) {
        updateFields.push('closing_messsage = ?')
        updateValues.push(updates.closing_messsage)
      }

      if (updates.jury_welcm_messsage) {
        updateFields.push('jury_welcm_messsage = ?')
        updateValues.push(updates.jury_welcm_messsage)
      }

      if (updates.is_social !== undefined) {
        updateFields.push('is_social = ?')
        updateValues.push(updates.is_social)
      }

      if (updates.social !== undefined) {
        if (Array.isArray(updates.social)) {
          updateFields.push('social = ?')
          updateValues.push(updates.social.join(','))
        } else {
          updateFields.push('social = ?')
          updateValues.push(updates.social)
        }
      }

      if (updates.social_image) {
        updateFields.push('social_image = ?')
        updateValues.push(updates.social_image)
      }

      if (updateFields.length === 0) {
        return reject(new Error('No update field provided.'))
      }
 
      const updateSql = `
        UPDATE event_details
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `

      db.query(updateSql, [...updateValues, eventId], (error, result) => {
        if (error) {
          console.log("db error:", error)
          return reject(new Error('Database update failed.'))
        }

        if (result.affectedRows > 0) {
          resolve(true)
        } else {
          reject(new Error('No affected row found with this ID.'))
        }
      })
    })
  })
}


export async function addSubmissionId(eventId, submission_id) {

  const updateSql = `UPDATE event_details SET submission_id = ? WHERE id = ?`
  const values = [submission_id, eventId]
  try {
    const result = await new Promise((resolve, reject) => {

      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database Update Error: ${updateError.message}`))
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows)
        } else {
          reject(new Error(resposne.noaffectedRowwithId))
        }
      })
    })
    return {
      affectedRows: result,
      message: resposne.SubmissionFormatUpdate
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`)
  }
}
// Check if the event is already visible
export function checkifAlreadyVisible(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_publicly_visble FROM event_details WHERE id = ?";
    db.query(query, [awardId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.visiblecheck));
      }
      if (results.length === 0) {
        return reject(new Error("Event not found"));
      }

      const isVisible = results[0].is_publicly_visble === 1;
      resolve(isVisible);
    });
  });
}

export async function publiclyVisible(eventId, is_publicly_visble) {
  const updateSql = `UPDATE event_details SET is_publicly_visble = ? WHERE id = ?`;
  const values = [is_publicly_visble, eventId];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database Update Error: ${updateError.message}`));
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows);
        } else {
          reject(new Error(resposne.noaffectedRows));
        }
      });
    });

    if (is_publicly_visble === 1) {
      return {
        affectedRows: result,
        message: resposne.publicVisibleTrue,
      };
    } else if (is_publicly_visble === 0) {
      return {
        affectedRows: result,
        message: resposne.visiblezero,
      };
    } else {
      throw new Error("Invalid visibility status provided. It must be 1 or 0.");
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
}


export async function generalSettings(
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
) {
  const insertSql = `INSERT INTO general_settings (
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
    is_abstain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const values = [
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
  ]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database Update Error: ${insertError.message}`))
        }

        if (result.affectedRows > 0) {
          resolve({ affectedRows: result.affectedRows, id: result.insertId })
        } else {
          reject(new Error(resposne.noaffectedRows))
        }
      })
    })

    return {
      affectedRows: result.affectedRows,
      id: result.id,
      message: resposne.generalSettingsSuccess
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`)
  }
}

export function overall_score(setingId, overall_score) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO overall_score (setingId, overall_score) 
      VALUES (?, ?)
    `

    db.query(query, [setingId, overall_score], (err, result) => {
      if (err) {
        reject(new Error(`Failed to insert Overall Score: ${err.message}`))
      } else {
        resolve({
          affectedRows: result.affectedRows,
          message: resposne.overallScoreINsertSuccess
        })
      }
    })
  })
}

export async function StartEndUpdate(
  event_id,
  start_date,
  end_date
) {

  const updateSql = `UPDATE event_details SET 
    start_date = ?,
  end_date = ?
  WHERE id = ?`
  const values = [
    event_id,
    start_date,
    end_date
  ]
  try {
    const result = await new Promise((resolve, reject) => {

      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database Update Error: ${updateError.message}`))
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows)
        } else {
          reject(new Error(resposne.noaffectedRowwithId))
        }
      })
    })
    return {
      affectedRows: result,
      message: resposne.startEndUpdateSuccess
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`)
  }
}

export async function liveEvent(eventId, is_live) {

  const updateSql = `UPDATE event_details SET is_live = ? WHERE id = ?`
  const values = [is_live, eventId]
  try {
    const result = await new Promise((resolve, reject) => {

      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database Update Error: ${updateError.message}`))
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows)
        } else {
          reject(new Error(resposne.noaffectedRowwithId))
        }
      })
    })
    return {
      affectedRows: result,
      message: resposne.EventLiveSuccess
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`)
  }
}

export async function archiveEvent(eventId, is_archive) {

  const updateSql = `UPDATE event_details SET is_archive = ? WHERE id = ?`
  const values = [is_archive, eventId]
  try {
    const result = await new Promise((resolve, reject) => {

      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database Update Error: ${updateError.message}`))
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows)
        } else {
          reject(new Error(resposne.noaffectedRowwithId))
        }
      })
    })
    return {
      affectedRows: result,
      message: resposne.EventArchiveSuccess
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`)
  }
}

export async function CreateScorecardCriteria(eventId, title, description) {
  const insertSql = `INSERT INTO criteria (eventId, title, description) VALUES (?, ?, ?)`
  const values = [eventId, title, description]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(insertError)
        }
        if (result.insertId) {
          resolve(result.insertId)
        } else {
          reject(new Error(resposne.scorecardCriteriaCreateFail))
        }
      })
    })

    return {
      id: result,
      message: resposne.scorecardCriteriaCreateSuccess,
    }
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

export function overallScorecardValue(criteriaId, eventId, overall_scorecard) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO overall_scorecard (criteriaId, eventId, scorecard_value) 
      VALUES (?, ?, ?)
    `
    db.query(query, [criteriaId, eventId, overall_scorecard], (err, result) => {
      if (err) {
        reject(new Error(resposne.overallvaluesFail))
      } else {
        resolve({
          id: result.insertId,
          message: resposne.overallScorecardValueSuccess,
        })
      }
    })
  })
}

export function criteriaSettings(criteriaId, eventId, criteria_type) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO criteria_settings (criteriaId, eventId, criteria_type) 
      VALUES (?, ?, ?)
    `
    db.query(query, [criteriaId, eventId, criteria_type], (err, result) => {
      if (err) {
        return reject(new Error(resposne.criteriaSettingCreateFail))
      }
      resolve({
        id: result.insertId,
        message: resposne.criteriaSettingCreateSuccess,
      })
    })
  })
}

export async function CreateCriteriaSettingValues(criteriaId, eventId, settingId, caption, value) {

  const insertSql = `INSERT INTO criteria_settings_values 
    (criteriaId, eventId, settingId, caption, value) 
    VALUES (?, ?, ?, ?, ?)`

  const values = [criteriaId, eventId, settingId, caption, value]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(resposne.settingValueCreateFail))
        }
        resolve({
          id: result.insertId,
          message: resposne.settingValueCreateSucces,
        })
      })
    })

    return result
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

export function checkIfDeletedCriteriaId(criteriaId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT is_deleted = 1 FROM criteria WHERE id = ?`

    db.query(query, [criteriaId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck))
      }
      if (results.length === 0) {
        return reject(new Error(resposne.criteriaIdnotFound))
      }
      resolve(results[0].is_deleted === 1)
    })
  })
}

export async function softDeleteCriteriaSettingValue(criteriaId) {
  const updateSql = `UPDATE criteria_settings_values SET is_deleted = 1 WHERE criteriaId = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [criteriaId], (err, result) => {
        if (err) return reject(new Error(resposne.settingValueUpdateFail))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.nocriteriaIdFound)
    }

    return { message: resposne.settingvalueDeletedSuccess, affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export async function softDeleteCriteriaSetting(criteriaId) {
  const updateSql = `UPDATE criteria_settings SET is_deleted = 1 WHERE criteriaId = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [criteriaId], (err, result) => {
        if (err) return reject(new Error("resposne.settingValueUpdateFail"))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.nocriteriaIdFound)
    }

    return { message: "resposne.settingvalueDeletedSuccess", affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export async function softDeleteCriteria(criteriaId) {
  const updateSql = `UPDATE criteria SET is_deleted = 1 WHERE id = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [criteriaId], (err, result) => {
        if (err) return reject(new Error("resposne.settingValueUpdateFail"))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.nocriteriaIdFound)
    }

    return { message: "resposne.settingvalueDeletedSuccess", affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}


export async function CreateJuryGroup(eventId, group_name, filtering_pattern) {
  const insertSql = `INSERT INTO jury_group (eventId, group_name, filtering_pattern) VALUES (?, ?, ?)`
  const values = [eventId, group_name, filtering_pattern]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database error: ${insertError.message}`))
        }
        if (result.insertId) {
          resolve(result.insertId)
        } else {
          reject(new Error(resposne.juryGroupNameCreateFail))
        }
      })
    })

    return {
      id: result,
      message: resposne.jurygroupNameCreateSuccess,
    }
  } catch (error) {
    throw new Error(`Error creating jury group: ${error.message}`)
  }
}

export async function CreateFilteringCriteria(eventId, groupId, category, IsValue) {
  const query = `INSERT INTO filtering_criteria (eventId, groupId, category, IsValue) VALUES (?, ?, ?, ?)`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(query, [eventId, groupId, category, IsValue], (err, result) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`))
        }
        resolve({
          id: result.insertId,
          message: resposne.FilteringCriteriaInsertSuccess,
        })
      })
    })

    return result
  } catch (error) {
    throw new Error(`Error creating filtering criteria: ${error.message}`)
  }
}

export async function CreateFilteringCriteriaCategory(eventId, groupId, filterId, category) {
  const insertSql = `INSERT INTO filtering_criteria_category (eventId, groupId, filterId, category) VALUES (?, ?, ?, ?)`
  const values = [eventId, groupId, filterId, category]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database error: ${insertError.message}`))
        }
        resolve({
          id: result.insertId,
          message: resposne.filteringCriteriaCategoryCreateSuccess,
        })
      })
    })

    return result
  } catch (error) {
    throw new Error(`Error creating filtering criteria category: ${error.message}`)
  }
}

export async function AssignJury(
  eventId,
  group_name,
  email,
  first_name,
  last_name,
  is_readonly,
  is_auto_signin,
  is_assign_New,
  is_assign_close,
  is_assign_send
) {
  const insertSql = `
    INSERT INTO jury_assign (
      eventId,
      group_name,
      email,
      first_name,
      last_name,
      is_readonly,
      is_auto_signin,
      is_assign_New,
      is_assign_close,
      is_assign_send
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const values = [
    eventId,
    group_name,
    email,
    first_name,
    last_name,
    is_readonly,
    is_auto_signin,
    is_assign_New,
    is_assign_close,
    is_assign_send
  ]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database insert error: ${insertError.message}`))
        }
        if (result.insertId) {
          resolve(result.insertId)
        } else {
          reject(new Error(resposne.assignJuryCreateFail))
        }
      })
    })

    return {
      id: result,
      message: resposne.assignJuryCreateSuccess
    }
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

export function getScorecard() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
          e.id AS event_id,
          c.id AS criteria_id,
          c.title,
          c.description,
          os.scorecard_value,
          os.id AS overall_scorecard_id,
          cs.criteriaId AS criteria_setting_id,
          cs.criteria_type,
          cv.settingId AS criteria_setting_id_value,
          cv.caption,
          cv.value AS criteria_value
      FROM event_details e
      LEFT JOIN criteria c ON c.eventId = e.id
      LEFT JOIN overall_scorecard os ON os.criteriaId = c.id AND os.eventId = e.id
      LEFT JOIN criteria_settings cs ON cs.criteriaId = c.id
      LEFT JOIN criteria_settings_values cv ON cv.settingId = cs.id
      WHERE e.is_deleted = 0 AND c.id IS NOT NULL
      ORDER BY e.id, c.id
    `

    db.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }

      const scorecardMap = {}

      results.forEach(result => {
        const criteriaId = result.criteria_id

        if (!scorecardMap[criteriaId]) {
          scorecardMap[criteriaId] = {
            criteria_id: criteriaId,
            event_id_from_criteria: result.event_id,
            title: result.title,
            description: result.description,
            scorecard_values: [],
            criteria_settings: []
          }
        }

        if (result.overall_scorecard_id &&
          !scorecardMap[criteriaId].scorecard_values.includes(result.scorecard_value)) {
          scorecardMap[criteriaId].scorecard_values.push(result.scorecard_value)
        }

        if (result.criteria_setting_id) {
          const setting = {
            criteria_type: result.criteria_type,
            caption: result.caption,
            value: result.criteria_value
          }

          const exists = scorecardMap[criteriaId].criteria_settings.some(s =>
            s.criteria_type === setting.criteria_type &&
            s.caption === setting.caption &&
            s.value === setting.value
          )

          if (!exists) {
            scorecardMap[criteriaId].criteria_settings.push(setting)
          }
        }
      })

      const Results = Object.values(scorecardMap)

      resolve(Results)
    })
  })
}

export async function updateScorecardCriteria(criteriaId, title, description) {
  const updateSql = `UPDATE criteria SET title = ?, description = ? WHERE id = ?`
  const values = [title, description, criteriaId]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(updateError)
        }
        if (result.affectedRows > 0) {
          resolve({
            id: criteriaId,
            message: resposne.scorecardCriteriaUpdateSuccess,
          })
        } else {
          reject(new Error(resposne.scorecardCriteriaUpdateFail))
        }
      })
    })

    return result
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

export function updateOverallScorecardValue(criteriaId, eventId, overall_scorecard) {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE overall_scorecard 
      SET scorecard_value = ? 
      WHERE criteriaId = ? AND eventId = ?
    `

    db.query(updateQuery, [overall_scorecard, criteriaId, eventId], (err, result) => {
      if (err) {
        return reject(new Error(resposne.overallvaluesUpdateFail))
      }


      if (result.affectedRows > 0) {
        resolve({
          id: criteriaId,
          message: resposne.overallScorecardValueUpdateSuccess,
        })
      } else {
        reject(new Error(resposne.overallvaluesUpdateFail))
      }
    })
  })
}


export function updateCriteriaSettings(criteriaId, eventId, criteria_type) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE criteria_settings 
      SET criteria_type = ? 
      WHERE criteriaId = ? AND eventId = ?
    `
    db.query(query, [criteria_type, criteriaId, eventId], (err, result) => {
      if (err) {
        return reject(new Error(resposne.criteriaSettingCreateFail))
      }
      if (result.affectedRows === 0) {
        return reject(new Error(resposne.noSettingFound))
      }
      resolve({
        message: resposne.settingUpdateSuccess,
      })
    })
  })
}

export function updateCriteriaSettingValues(criteriaId, eventId, settingId, caption, value) {
  return new Promise((resolve, reject) => {
    const updateSql = `
      UPDATE criteria_settings_values 
      SET caption = ?, value = ? 
      WHERE criteriaId = ? AND eventId = ? AND settingId = ?
    `
    const values = [caption, value, criteriaId, eventId, settingId]

    db.query(updateSql, values, (err, result) => {
      if (err) {
        return reject(new Error(resposne.settingvalueUpdateFail))
      }
      if (result.affectedRows === 0) {
        return reject(new Error(resposne.nosettingvalueFound))
      }
      resolve({
        message: resposne.criteriaSettingValueUpateSuccess,
      })
    })
  })
}

export async function UpdateJuryGroup(groupId, eventId, group_name, filtering_pattern) {
  const updateSql = `UPDATE jury_group SET eventId = ?, group_name = ?, filtering_pattern = ? WHERE id = ?`
  const values = [eventId, group_name, filtering_pattern, groupId]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database error: ${updateError.message}`))
        }
        if (result.affectedRows > 0) {
          resolve({
            id: groupId,
            message: resposne.juryGroupUpdateSuccess,
          })
        } else {
          reject(new Error(resposne.juryGroupUpdateFail))
        }
      })
    })

    return result
  } catch (error) {
    throw new Error(`Error updating jury group: ${error.message}`)
  }
}

export async function UpdateFilteringCriteria(criteriaId, eventId, groupId, category, IsValue) {
  const updateQuery = `UPDATE filtering_criteria SET eventId = ?, groupId = ?, category = ?, IsValue = ? WHERE id = ?`
  const values = [eventId, groupId, category, IsValue, criteriaId]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateQuery, values, (err, result) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`))
        }
        if (result.affectedRows > 0) {
          resolve({
            id: criteriaId,
            message: resposne.FilteringCriteriaUpdateSuccess,
          })
        } else {
          reject(new Error(resposne.FilteringCriteriaUpdateFail))
        }
      })
    })

    return result
  } catch (error) {
    throw new Error(`Error updating filtering criteria: ${error.message}`)
  }
}

export async function UpdateFilteringCriteriaCategory(eventId, groupId, filterId, category) {
  const updateSql = `UPDATE filtering_criteria_category SET category = ? WHERE eventId = ? AND groupId = ? AND filterId = ?`
  const values = [category, eventId, groupId, filterId]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (err, result) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`))
        }
        if (result.affectedRows === 0) {
          return reject(new Error(`No category found to update for filter ID ${filterId}.`))
        }
        resolve({
          id: filterId,
          message: resposne.filteringCriteriaCategoryUpdateSuccess,
        })
      })
    })
    return result
  } catch (error) {
    throw new Error(`Error updating filtering criteria category: ${error.message}`)
  }
}



export function checkifDeletedGroupId(groupId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT is_deleted = 1 FROM jury_group WHERE id = ?`
    db.query(query, [groupId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck))
      }
      if (results.length === 0) {
        return reject(new Error(resposne.groupnotFound))
      }
      resolve(results[0].is_deleted === 1)
    })
  })
}

export async function softDeleteJuryGroup(groupId) {
  const updateSql = `UPDATE jury_group SET is_deleted = 1 WHERE id = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [groupId], (err, result) => {
        if (err) return reject(new Error(resposne.groupUpdateFail))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.noGroupFound)
    }

    return { message: resposne.groupDeletedSuccess, affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export async function softDeleteFilteringCriteria(groupId) {
  const updateSql = ` UPDATE filtering_criteria SET is_deleted = 1 WHERE groupId = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [groupId], (err, result) => {
        if (err) return reject(new Error(resposne.filteringCriteriaUpdateFail))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.noIdFoundFilterCriteria)
    }

    return { message: resposne.filteringCriteriaDeletedSuccess, affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export async function softDeleteFilteringCriteriaCategory(groupId) {
  const updateSql = `UPDATE filtering_criteria_category SET is_deleted = 1 WHERE groupId = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [groupId], (err, result) => {
        if (err) return reject(new Error(resposne.filterCategoryUpdateFail))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.noIdFoundCategory)
    }

    return { message: resposne.categoryDeletedSuccess, affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export function getJuryGroup() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        jg.id AS juryGroupId,
        jg.group_name,
        jg.filtering_pattern
      FROM event_details e 
      LEFT JOIN jury_group jg ON jg.eventId = e.id
      WHERE e.is_deleted = 0
      AND jg.group_name IS NOT NULL
      AND jg.filtering_pattern IS NOT NULL
    `

    db.query(query, (error, results) => {
      if (error) {
        return reject(error)
      }

      const filteredResults = results.map(result => ({
        GroupId: result.juryGroupId,
        Group_Name: result.group_name,
        Formula: result.filtering_pattern
      }))

      const nonNullResults = filteredResults.filter(result =>
        result.GroupId !== null &&
        result.Group_Name !== null &&
        result.Formula !== null
      )

      resolve(nonNullResults)
    })
  })
}

export function checkIfDeletedFilterId(filterId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT is_deleted FROM filtering_criteria WHERE id = ?`

    db.query(query, [filterId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck))
      }
      if (results.length === 0) {
        return reject(new Error(resposne.filterIdnotFound))
      }
      resolve(results[0].is_deleted === 1)
    })
  })
}


export async function softDeleteGroupCriteria(filterId) {
  const updateSql = `UPDATE filtering_criteria SET is_deleted = 1 WHERE id = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [filterId], (err, result) => {
        if (err) return reject(new Error(resposne.groupCriteriaUpdateFail))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.noIdFoundGroupCriteria)
    }

    return { message: resposne.groupCriteriaDeletedSuccess, affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export async function softDeleteGroupCriteriaCategory(filterId) {
  const updateSql = `UPDATE filtering_criteria_category SET is_deleted = 1 WHERE filterId = ?`

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [filterId], (err, result) => {
        if (err) return reject(new Error(resposne.groupCategoryUpdateFail))
        resolve(result)
      })
    })

    if (result.affectedRows === 0) {
      throw new Error(resposne.noIdFoundGroupCategory)
    }

    return { message: resposne.groupCategoryDeletedSuccess, affectedRows: result.affectedRows }
  } catch (error) {
    // console.error(error)
    throw new Error(error.message)
  }
}

export function getJuryName() {

  return new Promise((resolve, reject) => {

    const query = `
        SELECT 
          email
          FROM jury_assign 
          WHERE is_deleted = 0   
      `

    db.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }

      resolve({
        Judges: results.length ? results : [],
      })
    })
  })
}

export function getAdminProfile(adminId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        time_zone,
        mobile_number,
        company,
        job_title,
        profile_image
      FROM admin
      WHERE id = ? AND is_deleted = 0
    `

    db.query(query, [adminId], (err, results) => {
      if (err) {
        return reject(err)
      }
      if (results.length === 0) {
        return reject(new Error('No Admin found for the given ID'))
      }
      resolve({
        admins: results,
      })
    })
  })
}

export async function createCoupon(
  eventId,
  category,
  coupon_name,
  coupon_code,
  percent_off,
  coupon_amount,
  start_date,
  end_date
) {
  const insertSql = `
INSERT INTO coupons (
    eventId,
    category,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date)VALUES (?, ?, ?, ?, ?, ?, ?, ?)

  `
  const values = [
    eventId,
    category,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date
  ]
  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(`Database insert Error : ${insertError.message}`))
        }
        if (result.insertId) {
          resolve(result.insertId)
        } else {
          reject(new Error(resposne.couponFail))
        }
      })
    })
    return {
      id: result,
      message: resposne.couponSuccess
    }
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}
export function checkAwardId(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM awards_category WHERE id = ?"
    db.query(query, [awardId], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results.length > 0 ? true : false)
      }
    })
  })
}

export async function getAwardById(awardId) {
  const selectSql = `
        SELECT 
        id,
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
      FROM awards_category 
      WHERE id = ?;

  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [awardId], (fetchError, results) => {
        if (fetchError) {
          return reject(fetchError);
        }

        if (results.length > 0) {
          return resolve(results[0]);
        } else {
          reject(new Error('Award not found'));
        }
        console.log("ressss", results)
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export function searchEvent(search) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM event_details 
      WHERE event_name LIKE ? AND is_deleted = 0`

    const values = [`%${search}%`]

    db.query(query, values, (error, results) => {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}


//----------------------------------------- dynamic from create  ----------------------------------------------//



// Create Registration Form
export const createRegistrationFormService = (eventId, form_schema) => {
  return new Promise((resolve, reject) => {
      const query = `INSERT INTO registration_form (eventId, form_schema) VALUES (?, ?)`;
      db.query(query, [eventId, JSON.stringify(form_schema)], (err, result) => {
          if (err) reject(err);
          else resolve(result);
      });
  });
};

// Get Registration Form by Event ID and registrationFormId
export const getRegistrationFormService = (eventId, registrationFormId) => {
  return new Promise((resolve, reject) => {
      const query = `SELECT * FROM registration_form WHERE eventId = ? AND id = ? AND is_deleted = 0`;
      db.query(query, [eventId, registrationFormId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
      });
  });
};

// Update Registration Form
export const updateRegistrationFormService = (eventId, form_schema) => {
  return new Promise((resolve, reject) => {
      const query = `UPDATE registration_form SET form_schema = ? WHERE eventId = ? AND is_deleted = 0`;
      db.query(query, [JSON.stringify(form_schema), eventId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
      });
  });
};

// Create Entry Form
export const createEntryFormService = (eventId, form_schema) => {
  return new Promise((resolve, reject) => {
      const query = `INSERT INTO entry_form (eventId, form_schema) VALUES (?, ?)`;
      db.query(query, [eventId, JSON.stringify(form_schema)], (err, result) => {
          if (err) reject(err);
          else resolve(result);
      });
  });
};

// Get Entry Form by Event ID
export const getEntryFormService = (eventId) => {
  return new Promise((resolve, reject) => {
      const query = `SELECT * FROM entry_form WHERE eventId = ? AND is_deleted = 0`;
      db.query(query, [eventId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
      });
  });
};

// Update Entry Form
export const updateEntryFormService = (eventId, form_schema) => {
  return new Promise((resolve, reject) => {
      const query = `UPDATE entry_form SET form_schema = ? WHERE eventId = ? AND is_deleted = 0`;
      db.query(query, [JSON.stringify(form_schema), eventId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
      });
  });
};


