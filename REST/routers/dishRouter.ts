
import  express,{ request,response } from "express";
import {dishControllers} from '../controllers/dishControllers'
import { check } from "express-validator";
import { validateFields } from "../middlewares/validateFields";
const routerDish = express.Router()
const dish = new dishControllers()

routerDish.get('/dish/', dish.getAll);

routerDish.post('/dish/create',
    check("name","name is required").notEmpty().isString().isLength({max:30}),
    check("price","price is required").notEmpty().isDecimal(),
    check("description","description is required").notEmpty().isString().isLength({max:100}),
    check("amount","amount is required").notEmpty().isInt(),
    check("category","category is required").notEmpty().isString().isLength({max:30}),
    check("img","img is required").optional().isLength({max:255}),

    validateFields,
    
    dish.newDish);


routerDish.patch('/dish/add_amount/',
    check("id_dish","id_dish is required").notEmpty().isInt(),
    check("amount","amount is required").notEmpty().isInt(),
    dish.addAmountDish);

export default routerDish