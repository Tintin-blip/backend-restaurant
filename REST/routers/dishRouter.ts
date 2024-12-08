
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
    check("img").optional().isLength({max:255}),

    validateFields,
    
    dish.newDish);


routerDish.patch('/dish/add_amount',
    check("id_dish","id_dish is required").notEmpty().isInt(),
    check("amount","amount is required").notEmpty().isInt(),
    validateFields,
    dish.addAmountDish);

routerDish.delete('/dish/delete', 
    check("id_dish","id_dish is required").notEmpty().isNumeric().isInt(),
    validateFields,
    dish.deleteDishWithId
)

routerDish.put('/dish/edit',
    check("id_dish","id_dish is required").notEmpty().isNumeric().isInt(),
    check("price","price is required").notEmpty().isDecimal(),
    check("description","description is required").notEmpty().isString().isLength({max:100}),
    check("category","category is required").notEmpty().isString().isLength({max:30}),
    check("img").optional().isLength({max:255}),
    validateFields,
    dish.editDishWithId
)

export default routerDish