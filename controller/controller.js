import { additional_emails, checkAdmin, createEvent, industry_types, } from "../service/service.js"

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

// export const deleteCriteria = async (req, res) => {
//   const { role } = req.user 

//   if (role !== "admin") {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: resposne.unauth,
//     })
//   }

//   const criteriaId = req.params.id

//   try {
//     const { isDeleted } = await checkIfDeletedCriteria(criteriaId)

//     if (isDeleted) {
//       return res.status(400).json({
//         status: resposne.successFalse,
//         message: resposne.criteriaAlreadyDeleted,
//       })
//     }

//         const settingsValueDeleted = await softDeleteSettingsValuesByCriteriaId(criteriaId);
//         if (settingsValueDeleted.affectedRows === 0) {
//           return res.status(400).json({
//             status: resposne.successFalse,
//             message: resposne.nodeletedSettingvalue,
//           });
//         }

//         const settingsDeleted = await softDeleteSettingsByCriteriaId(criteriaId);
//         if (settingsDeleted.affectedRows === 0) {
//           return res.status(400).json({
//             status: resposne.successFalse,
//             message: resposne.nodeletedSetting, 
//           });
//         }

//         const criteriaDeleted = await softDeleteCriteria(criteriaId);
//         if (criteriaDeleted.affectedRows === 0) {
//           return res.status(400).json({
//             status: resposne.successFalse,
//             message: resposne.nodeletedCriteria, 
//           });
//         }else{
//           return res.status(200).json({
//             status: resposne.successTrue,
//             message: resposne.criteriaDeleteSuccess, 
//           });
//         }

//   } catch (error) {
//     return res.status(400).json({
//       status: resposne.successFalse,
//       message: error.message,
//     })
//   }
// }

export const eventCreate = async (req, res) => {
  const role = req.user.role

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }
  const adminId = req.user.id
  const adminExists = await checkAdmin(adminId)
  if (!adminExists) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "No admin Id found or Admin does not exist",
    })
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
  } = req.body

  try {




    if (limit_submission === 1 && (submission_limit === undefined || submission_limit < 1)) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.submissionlimit,
      })
    }

    const logo = req.files["event_logo"] ? req.files["event_logo"][0].filename : null
    const banner = req.files["event_banner"] ? req.files["event_banner"][0].filename : null

    if (!logo && !banner) {
      console.warn('Both logo and banner are not provided.')
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
    )

    const industryCreate = await industry_types(eventResult.id, industry_type)
    if (industryCreate.err) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "failed to create industrytypes"
      })
    }
    const additionalEmailCreate = additional_emails(eventResult.id, additional_email)
    if (additionalEmailCreate) { 
      return res.status(400).json({
        status:resposne.successFalse,
        message:"failed to create  additional mails"
      })
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.createvent,
    })
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}