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

export function additional_emailssss(eventId, additonal_email) {
  return new Promise((resolve, reject) => {
    // Check if additonal_email is an array, otherwise default to empty array
    if (!Array.isArray(additonal_email)) {
      return reject(new Error("additonal_email must be an array"));
    }

    const insertSql = `
      INSERT INTO additional_emails (eventId, additonal_email)
      VALUES (?, ?)
    `;

    const queries = additonal_email.map((email) => {
      return new Promise((res, rej) => {
        // You can also add validation for email here (e.g., format check)
        db.query(insertSql, [eventId, email], (error, result) => {
          if (error) {
            console.log("Error adding additional email:", error);
            rej(error); // Reject the promise on error
          } else {
            res(result.insertId); // Resolve with the inserted email ID
          }
        });
      });
    });

    // Wait for all insertions to complete
    Promise.all(queries)
      .then((ids) => resolve(ids)) // Resolves with all email IDs
      .catch((error) => reject(error)); // Reject on any error
  });
}

export function industry_types(eventId, industry_types) {
  return new Promise((resolve, reject) => {
    // Check if industry_types is an array, otherwise default to empty array
    if (!Array.isArray(industry_types)) {
      return reject(new Error("industry_types must be an array"));
    }

    const insertSql = `
      INSERT INTO industry_types (eventId, industry_type) 
      VALUES (?, ?)
    `;

    const queries = industry_types.map((industry_type) => {
      return new Promise((res, rej) => {
        db.query(insertSql, [eventId, industry_type], (error, result) => {
          if (error) {
            console.log("Error adding industry type:", error);
            rej(error); // Reject promise on error
          } else {
            res(result.insertId); // Resolve with the inserted industry type ID
          }
        });
      });
    });

    // Wait for all insertions to complete
    Promise.all(queries)
      .then((ids) => resolve(ids)) // Resolves with all industry type IDs
      .catch((error) => reject(error)); // Reject on any error
  });
}



export const updateEventDetails = async (eventId, updates) => {
  let setClauses = [];
  let values = [];

  // Dynamically build the SQL query based on the provided updates
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
          eventId,
        });
      }

      resolve(result);
    });
  });
};



export const updateAdditionalEmails = async (eventId, additionalEmails) => {
  // Ensure additionalEmails is an array
  const emails = Array.isArray(additionalEmails) ? additionalEmails : [additionalEmails];

  if (emails.length === 0) {
    return Promise.reject(new Error("No valid additional emails to update"));
  }

  // Build the SQL query dynamically using multiple individual updates
  const updatePromises = emails.map(({ email, emailId }) => {
    // Ensure that both email and emailId are provided
    if (!emailId || !email) {
      return Promise.reject(new Error("Missing email or emailId"));
    }

    // SQL query to update the email for a given emailId and eventId
    const updateSql = `
      UPDATE additional_emails
      SET additonal_email = ?
      WHERE eventId = ? AND id = ?
    `;

    const values = [email, eventId, emailId];

    return new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating additional emails:", updateErr);
          return reject({
            message: "Failed to update additional emails",
            error: updateErr,
          });
        }

        // If no rows were updated, return an error
        if (updateResult.affectedRows === 0) {
          console.warn(`No email found to update for emailId ${emailId}`);
          return reject({
            message: "No matching email found to update",
            eventId,
            emailId,
          });
        }

        resolve(updateResult);
      });
    });
  });

  // Wait for all the email updates to be completed
  return Promise.all(updatePromises)
    .then((results) => {
      return {
        status: 'updated',
        updatedEmails: emails, // Include the emails that were successfully updated
      };
    })
    .catch((error) => {
      console.error("Error in updating emails:", error);
      return Promise.reject(new Error("Failed to update some emails"));
    });
};




export const updateIndustryTypes = async (eventId, industryTypes) => {
  // Ensure industryTypes is an array
  const types = Array.isArray(industryTypes) ? industryTypes : [industryTypes];

  // Check if there are no industry types to update
  if (types.length === 0) {
    return Promise.reject(new Error("No valid industry types to update"));
  }

  // Build an array of update promises for each industry type and its associated industry_type_id
  const updatePromises = types.map(({ industry_type, industry_type_id }) => {
    // Ensure that both industry_type and industry_type_id are provided
    if (!industry_type || !industry_type_id) {
      return Promise.reject(new Error("Missing industry_type or industry_type_id"));
    }

    // SQL query to update the industry_type for a given eventId and industry_type_id
    const updateSql = `
      UPDATE industry_types
      SET industry_type = ?
      WHERE eventId = ? AND industry_type_id = ?
    `;

    const values = [industry_type, eventId, industry_type_id];

    return new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating industry types:", updateErr);
          return reject({
            message: "Failed to update industry types",
            error: updateErr,
          });
        }

        // If no rows were updated, log a warning and reject the promise
        if (updateResult.affectedRows === 0) {
          console.warn(`No industry type found to update for eventId ${eventId} and industry_type_id ${industry_type_id}`);
          return reject({
            message: "No matching industry type found to update",
            eventId,
            industry_type_id,
          });
        }

        // Resolve if the update is successful
        resolve(updateResult);
      });
    });
  });

  // Wait for all the industry type updates to be completed
  return Promise.all(updatePromises)
    .then((results) => {
      return {
        status: 'updated',
        updatedIndustryTypes: types, // Include the industry types that were successfully updated
      };
    })
    .catch((error) => {
      // Log the error if any of the industry type updates fail
      console.error("Error in updating industry types:", error);
      return Promise.reject(new Error("Failed to update some industry types"));
    });
};
