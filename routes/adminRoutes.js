const express = require('express')
const router = express.Router();
const adminController = require('../controller/adminController');
const { validateAdmin, validateAdminLogin } = require('../Validation/Validation')
const authenticateToken = require('../middleware/authentication');
const { upload } = require('../Middleware/Multer');

router.post('/register', validateAdmin, adminController.registerAdmin)

router.post('/login', validateAdminLogin, adminController.loginAdmin)

router.post("/profileUpdate",)
module.exports = router;