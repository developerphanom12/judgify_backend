import { additional_emailssss, checkAdmin, checkeventEmail, createEvent, industry_types, } from "../service/service.js"

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