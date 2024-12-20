
const resposne = {
  successTrue: true,
  successFalse: false,
  admincreate: 'Create Admin Successfull',
  adminfailed: "Failed To Create Admin",
  checkphone: "Phonenumber Already Registered",
  checkEmail: "Email Already Registered",
  checkusername: "Username Already Registered",
  internalerror: "Internal server Error. Please try again later.",
  loginuser: "Failed To Login Admin",
  adminlginsuccess: "Admin Login Success",
  invalidformat: "Invalid token format",
  invalidtoken: "Invalid token",
  unauth: "Unauthorized user, please provide a token",
  emailnotexist: "Invalid Email or Does not exist ",
  invalidpassword: "Invalid password",
  invaliduser: "Invalid user",
  updateSuccess: "Admin Profile updated successfully",
  updateFail: "Admin Profile update failed",
  otpsend: "OTP Sent Successfully ",
  otpverified: "OTP verified successfully",
  otpnotverified: "OTP NOT VERIFIED",
  noupdate: "No data provided for update",
  otpstorefailed: "Failed to store OTP",
  otpverifyfailed: "Failed to verify OTP or Invalid otp",
  otpfailed: "Failed To Send Otp",
  invalidOtp: "Invalid OTP",
  passupdateSuccess: "Password updated successfully",
  createventfail: "Failed to create event.",
  createvent: "Event created successfully.",
  logobanner: "Both logo and banner images are required.",
  submisionlimit: "Submission limit value is required when Limit Submission is provided",
  diffrentemail: "The additional email should be different from the main email.",
  awardcreate: "Award created successfully.",
  awardcreatefail: "Failed to create Award.",
  downloadSuccess: "File downloaded succesfully",
  downloadFail: "Failed to export data to Excel",
  fetchSuccess: "Data Fetched Successfully",
  nodatavail: "failed to get Data",
  newPass: "New password and confirmation do not match.",
  missingPass: "Password is missing",
  novalidfield: "No valid fields to update",
  eventIdfail: "Invalid Event Id or not Found.",
  entryFormIdfail: "Invalid Entry Form Id or not Found.",
  regFormIdfail: "Invalid Registartion Form Id or not Found.",
  usernotfound: "User not found",
  errorchangePass: "An error occurred while changing the password",
  errorchangeverifyPass: "An error occurred while verifying the password",
  incorrectcurrentPass: "Current password is incorrect",
  hashingError: "An error occurred while hashing the password",
  updatePassError: "An error occurred while updating the password",
  passUpdateFail: "Password update failed",
  passChanged: "Password changed successfully",
  usercreate: "Create User Successfull",
  userlginsuccess: "User Login Success",
  usercreateEmailFail: "User created successfully, but failed to send email",
  newPassFail: "Error occured while creating new password",
  imageRequire: "Profile Image is required",
  is_start_REquired: "Start date is required when is_start_date is 1.",
  is_end_REquired: "End date is required when is_end_date is 1.",
  checkCurrentPass: "Invalid Password or does not match the exact Password",
  awardUpdateSuccess: "Awards Updated Successfully",
  awardUpdateFail: "Failed to Update Awards ",
  awardDeleted: "Award Deleted Successfully",
  awardNotFound: "Award category Not found Or does not exist",
  deleteAwardError: "Error Occured while deleting the Award Category",
  awardalreadyDeleted: "Award Category Already deleted",
  eventUpdateSuccess: "Events Updated Successfully",
  eventUpdateFail: "Failed to Update Event",
  updateventSuccess: "Event Updated Successfully",
  submissionFormatFail: "Failed to create Submission ID Format",
  submissionFormatSuccess: "Submission ID Format created successfully",
  noaffectedRowwithId: "No rows updated. Check if the event ID is valid.",
  SubmissionFormatUpdate: "Submission ID updated successfully",
  publicVisibleFalse: "Event can't be made visible to the public, error occurred.",
  publicVisibleTrue: "Event is now visible to the public.",
  draftTOLiveFail: "Event can't be made Live to the public, error occurred.",
  draftTOLiveSuccess: "Event is made Live now to the public.",
  overallScoreFail: "Failed to insert overall scores",
  generalSettingandUpdatedates: "Successfully created general settings and updated dates",
  noaffectedRowwithstartEnd: "No rows affected while updating start and end dates.",
  generalSettingsUpdatewithoutDate: "Successfully created general settings without updating dates",
  generalsettingsError: "An error occurred while creating general settings",
  noaffectedRows: "No rows affected",
  generalSettingsSuccess: "General settings created successfully",
  overallScoreINsertSuccess: "Overall score inserted successfully",
  overallvaluesFail: "Failed to insert some Overall Scorecard Values",
  overallScorecardValueSuccess: "Overall Scorecard Value inserted successfully",
  ScoreCradSuccess: "Scorecard Created Successfully",
  startEndUpdateSuccess: "Start And end date updated successfully",
  EventLiveSuccess: "Event Is posted Live successfully",
  EventArchiveSuccess: "Event Is Archived successfully",
  draftTOArchiveFail: "Event can't be Archived, error occurred.",
  criteriawithoutcaptionvalue: "Criteria settings created without Caption and value",
  criteriawithcaptionvalueSuccess: "Criteria settings with Caption and Value created successfully",
  criteriaFail:"Failed to create criteria values",
  criteriaNotFound: "Criteria Not found Or does not exist",
  criteriaDeleted: "Criteria Deleted Successfully",
  noChangesMade: "The criteria and settings were already deleted or do not exist.",
  deleteCriteriaError: "Error Occured while deleting the Criteria",
  nogroupCreate: "No group name was created.",
  insertFilteringCriteriafail: "Failed to insert some filtering criteria.",
  insertfilteringcriteriacategoryFail: "Failed to insert some filtering criteria categories.",
  FilteringCriteriaInsertSuccess: "Filtering Criteria inserted successfully",
  juryGroupCreateSuccess: "Jury group created successfully.",
  assignJuryCreateFail: "Failed to create assign jury: error occurred",
  assignJuryCreateSuccess: "Assign jury created successfully",
  additionalmailinsertFail: 'Failed to insert additional email',
  industrytypeInsertFail: 'Failed to insert industry type.',
  eventnotfound: "Event not found",
  insertORUpdateFail: 'Failed to update or insert additional email',
  invalidSocialplatform: 'Invalid social platform value. Allowed values are: facebook, linkedin, twitter.',
  noUpdateFieldProvided: "No update fields were provided.",
  dbUpdateFail: 'Database update failed.',
  scorecardCriteriaCreateFail: "Failed to create Scorecard Criteria",
  scorecardCriteriaCreateSuccess: "Scorecard Criteria created successfully",
  juryGroupNameCreateFail: "Failed to create Jury group name",
  jurygroupNameCreateSuccess: "Jury group name created successfully",
  filteringCriteriaCategoryCreateSuccess: "Filtering criteria category created successfully",
  assignJuryCreateFail: "Assign jury creation failed: No insert ID returned.",
  scorecardCriteriaCreateSuccess: "Scorecard criteria created successfully.",
  scorecardCriteriaCreateFail: "Failed to create scorecard criteria.",
  scorecardCriteriaUpdateSuccess: "Scorecard criteria updated successfully.",
  scorecardCriteriaUpdateFail: "Failed to update scorecard criteria.",
  overallScorecardValueSuccess: "Overall scorecard value added successfully.",
  overallvaluesFail: "Failed to add overall scorecard value.",
  overallScorecardValueUpdateSuccess: "Overall scorecard value updated successfully.",
  overallvaluesUpdateFail: "Failed to update overall scorecard value.",
  scorecardUpdateSuccess: "Scorecard Updated Successfully",
  nogroupCreate: "Failed to update the jury group.",
  juryGroupUpdateSuccess: "Jury group updated successfully.",
  insertFilteringCriteriafail: "Failed to update filtering criteria.",
  insertfilteringcriteriacategoryFail: "Failed to update filtering criteria categories.",
  juryGroupCreateSuccess: "Jury group created successfully.",
  filteringCriteriaInsertSuccess: "Filtering criteria inserted successfully.",
  filteringCriteriaCategoryCreateSuccess: "Filtering criteria category created successfully.",
  filteringCriteriaUpdateSuccess: "Filtering criteria updated successfully.",
  filteringCriteriaCategoryUpdateSuccess: "Filtering criteria category updated successfully.",
  filteringCriteriaUpdateFail: "Failed to update filtering criteria.",
  filteringCriteriaCategoryUpdateFail: "Failed to update filtering criteria category.",
  insertFilteringCriteriaCategoryFail: "Failed to update the filtering criteria category. Please check the provided IDs and try again.",
  FilteringCriteriaUpdateSuccess: "Filtering Criteria Updated Successfully. ",
  FilteringCriteriaUpdateFail: "Failed to Update Filtering Criteria. ",
  noDeltedCategory: " No filtering criteria categories were deleted.",
  nodeletedSetting: " No filtering criteria were deleted.",
  nodeletedGroup: " The jury group was not deleted.",
  groupDeleteSuccess: "Jury group Deleted SuccessFully",
  groupiddeletedalready: "Group ID already deleted or does not exist.",
  errorfilterCriteria: "Error While deleting Filtering Criteria Category. ",
  filterCriteriaDeletedNotfilterCriteria: "Category Deleted But Error occured while Deleting Filtering Criteria.",
  filterCriteriaFilterCriteriaDeletedNotgroup: "Category and Filtering Criteria Deleted But Error occured while Deleting Jury group.",
  criteriaSettingCreateFail: "Failed to update Criteria Setting's criteria_type value",
  noSettingFound: "No criteria settings found to update",
  settingUpdateSuccess: "Criteria Setting's criteria_type updated successfully",
  settingvalueUpdateFail: "Failed to update Criteria settings value",
  nosettingvalueFound: "No criteria settings values found to update",
  criteriaSettingValueUpateSuccess: "Criteria settings value updated successfully",
  deletionerrorCheck: "Error checking deletion status",
  visiblecheck:"error checking visible check",
  groupnotFound: "Group not found",
  groupUpdateFail: "Failed to update jury group status",
  noGroupFound: "No jury group found with the provided ID",
  groupDeletedSuccess: "Jury group soft deleted successfully",
  filteringCriteriaUpdateFail: "Failed to update filtering criteria status",
  noIdFoundFilterCriteria: "No filtering criteria found with the provided ID",
  filteringCriteriaDeletedSuccess: "filtering criteria soft deleted successfully",
  filterCategoryUpdateFail: "Failed to update filtering criteria category status",
  noIdFoundCategory: "No filtering criteria category found with the provided ID",
  categoryDeletedSuccess: "filtering criteria category soft deleted successfully",
  criteriaSettingCreateFail: "Failed to insert Criteria Setting's criteriatype value",
  criteriaSettingCreateSuccess: "Criteria Setting's criteriatype inserted successfully",
  settingValueCreateFail: "Failed to create Criteria settings value",
  settingValueCreateSucces: "Criteria settings value created successfully",
  juryGroupUpdateFail: "Failed to Update Jury group.",
  groupCriteriaUpdateFail: "Failed to update Jury group criteria status",
  noIdFoundGroupCriteria: "No Jury Group's filtering criteria found with the provided ID",
  groupCriteriaDeletedSuccess: "Jury Group's filtering criteria soft deleted successfully",
  filterIdnotFound: "FilterId not found",
  groupCategoryUpdateFail: "Failed to update Jury group's filtering criteria category status",
  noIdFoundGroupCategory: "No Jury group's filtering criteria category found with the provided ID",
  groupCategoryDeletedSuccess: "Jury group's filtering criteria category soft deleted successfully",
  errorGroupCategoryDelete: "Error While deleting jury Group's Filtering Criteria Category. ",
  filterIdDeletedAlready: "FilterId already deleted or does not exist.",
  categoryDeletedNotJuryCriteria: "Jury group's Category Deleted But Error occured while Deleting Jury group's Filtering Criteria.",
  filterDeleteSuccess: "Jury group's Criteria Deleted SuccessFully",
  criteriaIdnotFound: "CriteriaId not found",
  settingValueUpdateFail: "Failed to update Scorecard's criteria settings values status",
  nocriteriaIdFound: "No Scorecard's criteria found with the provided ID",
  settingvalueDeletedSuccess: "Scorecard's criteria settings Value soft deleted successfully",
  criteriaIdDeletedalready: "Criteria ID already deleted or does not exist.",
  errorSettingValueDelete: "Error While deleting ScoreCard's Criteria Setting Value.",
  valueDeletedNotSetting: "ScoreCard's Value Deleted But Error occured while Deleting Criteria Setting.",
  valueSettingDeletedNotCriteria: "ScoreCard's Setting and Value Deleted But Error occured while Deleting Criteria.",
  criteriaDeleteSuccess: "ScoreCard's Criteria Deleted SuccessFully",
  otpIdfail: "Invalid Otp Id or not Found.",
  couponCreatefail:"Failed to create Coupon Code.",
  couponCreateSuccess:"Coupon Code SuccessFully Created.",
  couponFail:"CreateCoupon failed",
  couponSuccess:"Create Coupon success",
  AwardIdRequired:"Invalid Award Id or not Found.",
  awardDeleted:"Award not found or Deleted ",
  checkvisible: "Event  Already visible to public",
  visiblezero: "Event is now made private" ,
  noadmin:"No admin Id found or Admin does not exist",
  regFormTrue:"Registration form created successfully",
  noregIdEventId:"No data found for the given eventId and registrationFormId",
  regFormFetch:"Registration form fetched successfully",
  entryTrue:"Entry form created successfully",
  entryFailed:"Failed to create entry form",
  entryFormFetch:"Entry form fetched successfully",
   regUpdateSucess:"Registartion form updated successfully",
   noentryIdEventId:"No Entry form found for this event",
   noformFound:"No Form or deleted Form ",
   entrySuccess:"Entry form updated successfully",

}
export default resposne
