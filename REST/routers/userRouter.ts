import  express from "express";
import controlersUser from '../controllers/userControllers'
import { check } from "express-validator";
import {validateFields} from '../middlewares/validateFields'
import {rateLimit} from 'express-rate-limit'
const routerUser = express.Router()
const users = new controlersUser()

//routerUser.get('/user/', users.getUserByIdController)

const loginLimiter = rateLimit( {
    windowMs:60 * 1000,
    limit:3
})

routerUser.post('/user/sign',
    loginLimiter,
    check("ci","ci is required").notEmpty().isNumeric().isInt(),
    check("password","password is required").notEmpty().isString(),
    validateFields,
    users.signInController)

routerUser.post('/user/create',
    check("name","name is required").notEmpty().isString(),
    check("password","password is required").notEmpty().isString(),
    check("rol","rol is required").notEmpty().isString(),
    validateFields,
    users.createUserController)

export default routerUser