import express from "express"
import authenticate from "../middleware/authentication.js"
import { eventCreate } from "../controller/controller.js"
import upload from '../middleware/multer.js'

const router = express.Router()

router.post('/createEvent', authenticate,upload.fields([{ name: 'event_logo', maxCount: 1 }, { name: 'event_banner', maxCount: 1 }]), eventCreate)

export default router   