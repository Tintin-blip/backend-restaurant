import  express,{ request,response } from "express";
import controlersUser from '../controllers/userControllers'
import { Auth } from "../auth";
import { check } from "express-validator";
import {validateFields} from '../middlewares/validateFields'
const routerUser = express.Router()
const users = new controlersUser()

//routerUser.get('/user/', users.getUserByIdController)

routerUser.get('/user/sign',
    check("name","name is required").notEmpty().isString(),
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