import { resolve } from "path";
import db from "../database/connection.js"
import dotenv from "dotenv"
import { error } from "console";
dotenv.config()

const resposne = {
  criteriaAlreadyDeleted: "Criteria Already deleted",
  criteriaNotFound: "Criteria not found.",
  criteriaDeleted: "Criteria deleted successfully.",
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
      message: resposne.createvent,
      statusCode: 201
    };
  } catch (error) {
    console.log("Error in createEvent:", error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export function additional_emailssss(eventId, additional_email) {
  return new Promise((resolve, reject) => {
    const InsertSql = `Insert INTO additional_emails (eventId,additonal_email)
      VALUES (?,?)
      `
    const queries = additional_email.map((additional_email) => {
      return new Promise((res, rej) => {
        db.query(InsertSql, [eventId, additional_email], (error, result) => {
          if (error) {
            console.log("additional Error:", error)
            rej(error)
          } else {
            res(result.insertId)
          }
        })
      })
    })
    Promise.all(queries).then((ids) => resolve(ids)).catch((error) => reject(error))
  })
}

export function industry_types(eventId, industry_types) {
  return new Promise((resolve, reject) => {
    const InsertSql = `INSERT INTO industry_types (eventId, industry_type) 
   VALUES (?, ?)`
    const queries = industry_types.map((industry_type) => {
      return new Promise((res, rej) => {
        db.query(InsertSql, [eventId, industry_type], (error, result) => {
          if (error) {
            console.log("industry Error:", error)
            rej(error)
          } else {
            res(result.insertId)
          }
        })
      })
    })
    console.log("industry Error:", error)
    Promise.all(queries).then((ids) => resolve(ids)).catch((error) => reject(error))

  })
}