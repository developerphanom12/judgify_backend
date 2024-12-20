import { checkeventId } from "../service/adminService.js";
import { additional_emailssss, checkAdmin, checkeventEmail, createEvent,  industry_types, updateAdditionalEmails, updateEventDetails, updateIndustryTypes, } from "../service/service.js"

const resposne = {
  successFalse: false,
  successTrue: true,
  unauth: "Unauthorized user, please provide a token",
  criteriaAlreadyDeleted: "Criteria Already deleted",
  criteriaDeleted: "Criteria deleted successfully.",
  nodeletedSettingvalue: " No settings values were deleted, as they either don't exist or were already deleted.",
  nodeletedSetting: " No settings were deleted, as they either don't exist or were already deleted.",
  nodeletedCriteria: " No Criteria were deleted, as they either don't exist or were already deleted.",

  criteriaDeleteSuccess: "Criteria Deleted SuccessFully",
}

export const eventCreate = async (req, res) => {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const adminId = req.user.id;
  const adminExists = await checkAdmin(adminId);
  if (!adminExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "No admin Id found or Admin does not exist",
    });
  }
  const {

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
    event_description,
    industry_type,
    additional_email,
  } = req.body;

  const checkEmail = await checkeventEmail(email)
  if(checkEmail){
    return res.status(400).json({
      status:resposne.successFalse,
      message:"email already exist."
    })
  }
  try {


    if (limit_submission === 1 && (submission_limit === undefined || submission_limit < 1)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submissionlimit,
      });
    }

    const logo = req.files["event_logo"] ? req.files["event_logo"][0].filename : null;
    const banner = req.files["event_banner"] ? req.files["event_banner"][0].filename : null;

    if (!logo && !banner) {
      console.warn('Both logo and banner are not provided.');
    }

    const eventResult = await createEvent(
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
      logo,
      banner,
      event_description
    );
    const emailcreate = await additional_emailssss(eventResult.id,additional_email)
    if(emailcreate.error){
      return res.status(400).json({
        status:false,
        message:"failed to create additional email"
      })
    }

    const indstrycreate = await industry_types(eventResult.id,industry_type)
    if(indstrycreate.error){
      return res.status(400).json({
        status:false,
        message:error.message
      })
    }

 
    return res.status(200).json({
      status: resposne.successTrue,
      message: "resposne.createvent",
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const eventUpdate = async (req, res) => {
  const { role } = req.user;

  // Check if user is an admin
  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successTrue,
      message: resposne.unauth,
    });
  }

  const { eventId, additional_email, industry_type, ...eventUpdates } = req.body;

  // Check if eventId exists
  const eventExists = await checkeventId(eventId);
  if (!eventExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "resposne.eventIdfail",
    });
  }

  try {
    // Prepare updates object dynamically
    const updates = {};

    if (eventUpdates.event_name) updates.event_name = eventUpdates.event_name;
    if (eventUpdates.closing_date) updates.closing_date = eventUpdates.closing_date;
    if (eventUpdates.closing_time) updates.closing_time = eventUpdates.closing_time;
    if (eventUpdates.email) updates.email = eventUpdates.email;
    if (eventUpdates.event_url) updates.event_url = eventUpdates.event_url;
    if (eventUpdates.time_zone) updates.time_zone = eventUpdates.time_zone;
    if (eventUpdates.is_endorsement) updates.is_endorsement = eventUpdates.is_endorsement;
    if (eventUpdates.is_withdrawal) updates.is_withdrawal = eventUpdates.is_withdrawal;
    if (eventUpdates.is_ediit_entry) updates.is_ediit_entry = eventUpdates.is_ediit_entry;
    if (eventUpdates.limit_submission) updates.limit_submission = eventUpdates.limit_submission;
    if (eventUpdates.submission_limit) updates.submission_limit = eventUpdates.submission_limit;

    // Handle additional email and industry type updates
    if (additional_email && additional_email.length > 0) updates.additional_email = additional_email;
    if (industry_type && industry_type.length > 0) updates.industry_type = industry_type;

    // Check if there are no updates to be made
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "resposne.nodataupdate",
      });
    }

    const updatePromises = [];

    // Add event details update to promises
    if (Object.keys(updates).length > 0) {
      updatePromises.push(
        updateEventDetails(eventId, updates).catch((error) => {
          // Log the error message before throwing it
          console.error("Error updating event details:", error);
    
          throw {
            status: resposne.successFalse,
            message: "resposne.novalidfield",
            ermessage: error.message, // Ensure the error message is captured properly
          };
        })
      );
    }
    
    // Handle additional emails update if provided
    if (additional_email && additional_email.length > 0) {
      updatePromises.push(
        updateAdditionalEmails(eventId, additional_email).catch((error) => {
          throw {
            status: resposne.successFalse,
            message: error.message,
          };
        })
      );
    }

    // Handle industry types update if provided
    if (industry_type && industry_type.length > 0) {
      updatePromises.push(
        updateIndustryTypes(eventId, industry_type).catch((error) => {
          throw {
            status: resposne.successFalse,
            message: error.message,
          };
        })
      );
    }

    // Ensure that at least one update is performed
    if (updatePromises.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "error.message",
      });
    }

    // Wait for all promises to complete
    await Promise.all(updatePromises);

    // Prepare the updated fields for resposne
    const updatedFields = [
      ...Object.keys(updates),
      ...(additional_email ? ['additional_email'] : []),
      ...(industry_type ? ['industry_type'] : []),
    ];

    return res.status(200).json({
      status: resposne.successTrue,
      message: "resposne.eventUpdateSuccess",
      data: { eventId, updatedFields },
    });

  } catch (error) {
    console.error('Event Update Unexpected Error:', error);

    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};




