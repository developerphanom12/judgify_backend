import db from "../database/connection.js"
import dotenv from "dotenv"
dotenv.config()

const resposne = {
    criteriaAlreadyDeleted: "Criteria Already deleted",
    criteriaNotFound: "Criteria not found.",
    criteriaDeleted: "Criteria deleted successfully.",
}

// async function queryDb(sql, params) {
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => {
//             if (err) return reject(err)
//             resolve(result)
//         })
//     })
// }

// async function softDelete(table, criteriaId) {
//     const updateSql = `UPDATE ${table} SET is_deleted = 1 WHERE id = ?`

//     try {
//         const result = await queryDb(updateSql, [criteriaId])

//         if (result.affectedRows === 0) {
//             throw new Error(resposne.criteriaNotFound)
//         }

//         return resposne.criteriaDeleted
//     } catch (error) {
//         throw new Error(error.message)
//     }
// }

// export async function softDeleteCriteria(criteriaId) {
//     return softDelete('criteria', criteriaId)
// }

// export async function softDeleteCriteriaSettings(criteriaId) {
//     return softDelete('criteria_settings', criteriaId)
// }

// export async function checkIfDeletedCriteria(criteriaId) {
//     const criteriaQuery = "SELECT is_deleted FROM criteria WHERE id = ?"
//     const settingsQuery = "SELECT is_deleted FROM criteria_settings WHERE criteriaId = ?"
//     const settingsValuesQuery = "SELECT is_deleted FROM criteria_settings_values WHERE criteriaId = ?"

//     try {
//         const criteriaResults = await queryDb(criteriaQuery, [criteriaId])
//         if (criteriaResults.length === 0) {
//             throw new Error(resposne.criteriaNotFound)
//         }

//         const isCriteriaDeleted = criteriaResults[0].is_deleted === 1

//         const settingsResults = await queryDb(settingsQuery, [criteriaId])
//         const isSettingsDeleted = settingsResults.length > 0 && settingsResults[0].is_deleted === 1

//         const settingsValuesResults = await queryDb(settingsValuesQuery, [criteriaId])
//         const isSettingsValuesDeleted = settingsValuesResults.length > 0 && settingsValuesResults[0].is_deleted === 1

//         return {
//             isDeleted: isCriteriaDeleted,
//             isSettingsDeleted,
//             isSettingsValuesDeleted,
//         }
//     } catch (error) {
//         throw new Error(error.message)
//     }
// }

// export async function softDeleteSettingsByCriteriaId(criteriaId) {
//     const updateSql = `UPDATE criteria_settings SET is_deleted = 1 WHERE criteriaId = ?`
//     return queryDb(updateSql, [criteriaId])
// }

// export async function softDeleteSettingsValuesByCriteriaId(criteriaId) {
//     const updateSql = `UPDATE criteria_settings_values SET is_deleted = 1 WHERE criteriaId = ?`
//     return queryDb(updateSql, [criteriaId])
// }

// ! for coupon code creation
 
// var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// var text = '';

// for (var i = 0; i < 16; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
// }

// console.log(text);  // Outputs a random 16-character string
export function checkAdmin(adminId) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM admin WHERE id = ?"
      db.query(query, [adminId], (err, results) => {
        if (err) {
          return reject(new Error("Database query error while checking admin"))
        }
        resolve(results.length > 0)
      })
    })
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
    `
  
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
    ]
  
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(insertSql, values, (insertError, result) => {
          if (insertError) {
            return reject(new Error(`Error inserting event: ${insertError.message}`))
          }
          if (result.insertId) {
            resolve(result.insertId)
          } else {
            reject(new Error("Event creation failed: No insert ID"))
          }
        })
      })
  
      return {
        id: result,
        message: resposne.createvent,
        statusCode: 201
      }
    } catch (error) {
      // console.log("Error in createEvent:", error)
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
          return reject(new Error(resposne.additionalmailinsertFail))
        }
        resolve({
          message: resposne.additionalmailinsertFail,
          statusCode: 200
        })
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
          return reject(new Error(err.message))
        }
        resolve({
          message: resposne.industrytypeInsertFail,
          statusCode: 200
        })
      })
    })
  }
  