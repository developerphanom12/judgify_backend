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
  if (updates.is_edit_entry !== undefined) {
    setClauses.push("is_ediit_entry = ?");
    values.push(updates.is_edit_entry);
  }
  if (updates.limit_submission !== undefined) {
    setClauses.push("limit_submission = ?");
    values.push(updates.limit_submission);
  }
  if (updates.submission_limit !== undefined) {
    setClauses.push("submission_limit = ?");
    values.push(updates.submission_limit);
  }

  // Add the eventId for the WHERE clause
  values.push(eventId);

  // If no fields are to be updated, reject with an error
  if (setClauses.length === 0) {
    return Promise.reject({
      message: "No valid fields to update",
    });
  }

  // Combine the SET clauses into the final SQL query
  const updateSql = `
    UPDATE event_details
    SET ${setClauses.join(', ')}
    WHERE id = ?
  `;

  // Execute the update query
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


export const updateAdditionalEmails = async (eventId, additionalEmails) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE additional_emails 
      SET additonal_email = ? 
      WHERE eventId = ? AND additonal_email = ?
    `;

    const queries = additionalEmails.map((email) => {
      return new Promise((res, rej) => {
        db.query(updateQuery, [email, eventId, email], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Additional Email Update Error:", updateErr);
            return rej({
              message: "Failed to update additional email",
              email: email,
              error: updateErr
            }); 
          }

          if (updateResult.affectedRows === 0) {
            console.warn(`Email ${email} for eventId ${eventId} does not exist to update`);
            return rej({
              message: "Email does not exist to update",
              email: email,
              eventId: eventId
            });
          }
          res({
            email: email,
            status: 'updated'
          });
        });
      });
    });

    Promise.all(queries)
      .then((updatedEmails) => resolve(updatedEmails))
      .catch((error) => {
        console.error("Error in updating additional emails:", error);
        reject(error);
      });
  });
};


// Industry Types Update Function
export const updateIndustryTypes = async (eventId, industryTypes) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE industry_types 
      SET industry_type = ? 
      WHERE eventId = ? AND industry_type = ?
    `;

    const insertQuery = `
      INSERT INTO industry_types (eventId, industry_type) 
      SELECT ?, ? 
      WHERE NOT EXISTS (
        SELECT 1 FROM industry_types 
        WHERE eventId = ? AND industry_type = ?
      )
    `;

    const queries = industryTypes.map((industryType) => {
      return new Promise((res, rej) => {
        db.query(updateQuery, [industryType, eventId, industryType], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Industry Type Update Error:", updateErr);
            return rej({
              message: "Failed to update industry type",
              industryType: industryType,
              error: updateErr
            });
          }

          // If no rows updated, try to insert
          if (updateResult.affectedRows === 0) {
            db.query(insertQuery, [eventId, industryType, eventId, industryType], (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Industry Type Insert Error:", insertErr);
                return rej({
                  message: "Failed to insert industry type",
                  industryType: industryType,
                  error: insertErr
                });
              }

              if (insertResult.affectedRows === 0) {
                console.warn(`Failed to insert industry type ${industryType} for eventId ${eventId}`);
                return rej({
                  message: "Industry type insertion failed",
                  industryType: industryType,
                  eventId: eventId
                });
              }

              res({
                industryType: industryType,
                status: 'inserted'
              });
            });
          } else {
            res({
              industryType: industryType,
              status: 'updated'
            });
          }
        });
      });
    });

    Promise.all(queries)
      .then((updatedTypes) => resolve(updatedTypes))
      .catch((error) => {
        console.error("Error in updating industry types:", error);
        reject(error);
      });
  });
};