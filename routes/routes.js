import express from "express"
import authenticate from "../middleware/authentication.js"
import { eventCreate } from "../controller/controller.js"

const router = express.Router()

router.post('/createEvent', authenticate, eventCreate)

export default router   