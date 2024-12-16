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
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({
        status: false,
        message: "Unauthorized access"
      });
    }

    const { 
      eventId, 
      additional_email, 
      industry_type,
      ...eventUpdates 
    } = req.body;

    const eventExists = await checkeventId(eventId);
    if (!eventExists) {
      return res.status(400).json({
        status: false,
        message: "Event not found"
      });
    }

    const updatePromises = [];

    if (Object.keys(eventUpdates).length > 0) {
      updatePromises.push(
        updateEventDetails(eventId, eventUpdates)
          .catch(error => {
            console.error('Event Details Update Error:', error);
            throw new Error(`Event details update failed: ${error.message}`);
          })
      );
    }

    if (additional_email && additional_email.length > 0) {
      updatePromises.push(
        updateAdditionalEmails(eventId, additional_email)
          .catch(error => {
            console.error('Additional Emails Update Error:', error);
            throw new Error(`Additional emails update failed: ${error.message}`);
          })
      );
    }

    if (industry_type && industry_type.length > 0) {
      updatePromises.push(
        updateIndustryTypes(eventId, industry_type)
          .catch(error => {
            console.error('Industry Types Update Error:', error);
            throw new Error(`Industry types update failed: ${error.message}`);
          })
      );
    }

    if (updatePromises.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No updates provided"
      });
    }
    await Promise.all(updatePromises);

    const updatedFields = [
      ...Object.keys(eventUpdates),
      ...(additional_email ? ['additional_email'] : []),
      ...(industry_type ? ['industry_type'] : [])
    ];

    return res.status(200).json({
      status: true,
      message: "Event updated successfully",
      data: {
        eventId,
        updatedFields
      }
    });

  } catch (error) {
    console.error('Event Update Unexpected Error:', error);

    return res.status(400).json({
      status: false,
   message: error.message 
    });
  }
};

