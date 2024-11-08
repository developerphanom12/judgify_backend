import db from "../database/connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
const saltRounds = 10
import ExcelJS from 'exceljs'
import resposne from "../middleware/resposne.js"
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
            name: user.name,
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
            name: user.name,
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

export async function createEvent(
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
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

  `

  const values = [
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
  ]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error(resposne.createventfail))
        }
        if (result.insertId) {
          resolve(result.insertId)
        } else {
          reject(new Error(resposne.createventfail))
        }
      })
    })

    return {
      id: result,
      message: resposne.createvent
    }
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

export function additional_emails(eventId, additional_email) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO additional_emails (eventId, additonal_email) 
      VALUES (?, ?)
    `
    db.query(query, [eventId, additional_email], (err, result) => {
      if (err) {
        reject(new Error(resposne.additionalmailinsertFail))
      } else {
        resolve(result)
      }
    })
  })
}

export function industry_types(eventId, industry_type) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO industry_types (eventId, industry_type) 
      VALUES (?, ?)
    `
    db.query(query, [eventId, industry_type], (err, result) => {
      if (err) {
        reject(new Error(resposne.industrytypeInsertFail))
      } else {
        resolve(result)
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
      `

    db.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }

      resolve(results.length ? results : [])
    })
  })
}

export function exportToExcel() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Award Category")

  worksheet.columns = [
    { header: "id.", key: "id", width: 5 },
    { header: "EventId.", key: "eventId", width: 12 },
    { header: "Category Name", key: "category_name", width: 20 },
    { header: "Category Prefix", key: "category_prefix", width: 15 },
    { header: "Belongs Group", key: "belongs_group", width: 35 },
    { header: "Limit Submission", key: "limit_submission", width: 35 },
    { header: "Closing Date", key: "closing_date", width: 25 }
  ]

  return new Promise((resolve, reject) => {
    db.connect()
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
          return reject(err)
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
          })
        })

        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { bold: true }
        })

        workbook.xlsx.writeBuffer()
          .then(buffer => resolve(buffer))
          .catch(err => reject(err))
      })
  })
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
      `

    db.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }

      resolve(results.length ? results : [])
    })
  })
}

export async function checkCurrentPass(user, password) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE id = ?"

    if (!password) {
      return resolve({ error: resposne.missingPass })
    }

    db.query(query, [user.id], async (err, results) => {
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

export function getMyEvents(skip, limit) {

  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM event_details
      WHERE is_deleted = 0
    `

    db.query(countQuery, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr)
      }

      const totalCount = countResults[0].totalCount

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
      `

      db.query(query, [parseInt(limit), parseInt(skip)], (err, results) => {
        if (err) {
          return reject(err)
        }

        resolve({
          totalCount: totalCount,
          events: results.length ? results : [],
        })
      })
    })
  })
}

export function sortbyoldest() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *  
      FROM event_details 
      WHERE is_deleted = 0
      ORDER BY created_at ASC   
    `

    db.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }

      resolve(results)
    })
  })
}

export function sortbynewest() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *  
      FROM event_details 
      WHERE is_deleted = 0
      ORDER BY created_at DESC   
    `

    db.query(query, (err, results) => {
      if (err) {
        return reject(err)
      }

      resolve(results)
    })
  })
}

export function getMyEventsSorted(skip, limit) {

  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM event_details
    `

    db.query(countQuery, (countErr, countResults) => {
      if (countErr) {
        return reject(countErr)
      }

      const totalCount = countResults[0].totalCount

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
      `

      db.query(query, [parseInt(limit), parseInt(skip)], (err, results) => {
        if (err) {
          return reject(err)
        }

        resolve({
          totalCount: totalCount,
          events: results.length ? results : [],
        })
      })
    })
  })
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
  `

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
  ]

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(new Error(`Database update error: ${updateError.message}`))
        }
        if (result.affectedRows > 0) {
          resolve({ message: resposne.awardUpdateSuccess })
        } else {
          reject(new Error(resposne.awardUpdateFail))
        }
      })
    })

    return result
  } catch (error) {
    throw new Error(`Failed to update award: ${error.message}`)
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
    const query = "SELECT is_deleted = 1 FROM awards_category WHERE id = ?"
    db.query(query, [awardId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck))
      }
      if (results.length === 0) {
        return reject(new Error("Award not found"))
      }
      resolve(results[0].is_deleted === 1)
    })
  })
}

export async function getEventById(event_id) {
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
        GROUP_CONCAT(ae.additional_email) AS additional_emails,  -- Corrected typo
        GROUP_CONCAT(it.industry_type) AS industry_types
    FROM event_details ed
    LEFT JOIN industry_types it ON ed.id = it.eventId
    LEFT JOIN additional_emails ae ON ed.id = ae.eventId
    WHERE ed.id = ?
    GROUP BY ed.id
  `

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [event_id], (fetchError, results) => {
        if (fetchError) {
          return reject(fetchError)
        }
        if (results.length > 0) {
          const event = results[0]

          if (event.industry_types) {
            event.industry_types = event.industry_types.split(',')
          } else {
            event.industry_types = []
          }

          if (event.additional_emails) {
            event.additional_emails = event.additional_emails.split(',')
          } else {
            event.additional_emails = []
          }

          resolve(event)
        } else {
          reject(new Error(resposne.eventnotfound))
        }
      })
    })

    return result
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
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

export const updateEventDetails = async (
  eventId,
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
  submission_limit
) => {
  const updateSql = `
    UPDATE event_details SET
      event_name = ?,
      closing_date = ?,
      closing_time = ?,
      email = ?,
      event_url = ?,
      time_zone = ?,
      is_endorsement = ?,
      is_withdrawal = ?,
      is_ediit_entry = ?,  
      limit_submission = ?,
      submission_limit = ?
    WHERE id = ?
  `

  const values = [
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
    eventId
  ]

  return new Promise((resolve, reject) => {
    db.query(updateSql, values, (updateError, result) => {
      if (updateError) {
        return reject(updateError)
      }
      resolve(result)
    })
  })
}

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

export function updateAdditionalEmails(eventId, additionalEmail) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO additional_emails (eventId, additonal_email) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE additonal_email = ?
    `
    db.query(query, [eventId, additionalEmail, additionalEmail], (err, result) => {
      if (err) {
        reject(new Error(resposne.insertORUpdateFail))
      } else {
        resolve(result)
      }
    })
  })
}

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
        return reject(new Error(resposne.eventnotfound))
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
        const validSocialPlatforms = ['facebook', 'linkedin', 'twitter']
        if (!validSocialPlatforms.includes(updates.social)) {
          return reject(new Error(resposne.invalidSocialplatform))
        }
        updateFields.push('social = ?')
        updateValues.push(updates.social)
      }

      if (updates.social_image) {
        updateFields.push('social_image = ?')
        updateValues.push(updates.social_image)
      }

      if (updateFields.length === 0) {
        return reject(new Error(resposne.noUpdateFieldProvided))
      }

      const updateSql = `
        UPDATE event_details
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `

      db.query(updateSql, [...updateValues, eventId], (error, result) => {
        if (error) {
          return reject(new Error(resposne.dbUpdateFail))
        }

        if (result.affectedRows > 0) {
          resolve(true)
        } else {
          reject(new Error(resposne.noaffectedRowwithId))
        }
      })
    })
  })
}

export async function addSubmissionId(id, submission_id) {

  const updateSql = `UPDATE event_details SET submission_id = ? WHERE id = ?`
  const values = [submission_id, id]
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

export async function publiclyVisible(id, is_publicly_visble) {

  const updateSql = `UPDATE event_details SET is_publicly_visble = ? WHERE id = ?`
  const values = [is_publicly_visble, id]
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
      message: resposne.publicVisibleTrue
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`)
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
    const query = `SELECT is_deleted = 1 FROM criteria WHERE id = ?`;
    
    db.query(query, [criteriaId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck));
      }
      if (results.length === 0) {
        return reject(new Error(resposne.criteriaIdnotFound));
      }
      resolve(results[0].is_deleted === 1);
    });
  });
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

    return { message:resposne.settingvalueDeletedSuccess, affectedRows: result.affectedRows }
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

    return { message:"resposne.settingvalueDeletedSuccess", affectedRows: result.affectedRows }
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

    return { message:"resposne.settingvalueDeletedSuccess", affectedRows: result.affectedRows }
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
    `;

    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }

      const filteredResults = results.map(result => ({
        GroupId: result.juryGroupId,
        Group_Name: result.group_name,
        Formula: result.filtering_pattern
      }));

      const nonNullResults = filteredResults.filter(result =>
        result.GroupId !== null &&
        result.Group_Name !== null &&
        result.Formula !== null
      );

      resolve(nonNullResults);
    });
  });
}

export function checkIfDeletedFilterId(filterId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT is_deleted FROM filtering_criteria WHERE id = ?`;
    
    db.query(query, [filterId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck));
      }
      if (results.length === 0) {
        return reject(new Error(resposne.filterIdnotFound));
      }
      resolve(results[0].is_deleted === 1);
    });
  });
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
