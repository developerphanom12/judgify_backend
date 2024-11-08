import { checkIfDeletedCriteria, softDeleteCriteria, softDeleteSettingsByCriteriaId, softDeleteSettingsValuesByCriteriaId } from "../service/service.js"

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

export const deleteCriteria = async (req, res) => {
  const { role } = req.user 

  if (role !== "admin") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    })
  }

  const criteriaId = req.params.id

  try {
    const { isDeleted } = await checkIfDeletedCriteria(criteriaId)

    if (isDeleted) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.criteriaAlreadyDeleted,
      })
    }

        const settingsValueDeleted = await softDeleteSettingsValuesByCriteriaId(criteriaId);
        if (settingsValueDeleted.affectedRows === 0) {
          return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.nodeletedSettingvalue,
          });
        }
    
        const settingsDeleted = await softDeleteSettingsByCriteriaId(criteriaId);
        if (settingsDeleted.affectedRows === 0) {
          return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.nodeletedSetting, 
          });
        }
    
        const criteriaDeleted = await softDeleteCriteria(criteriaId);
        if (criteriaDeleted.affectedRows === 0) {
          return res.status(400).json({
            status: resposne.successFalse,
            message: resposne.nodeletedCriteria, 
          });
        }else{
          return res.status(200).json({
            status: resposne.successTrue,
            message: resposne.criteriaDeleteSuccess, 
          });
        }
    
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    })
  }
}

