import * as joi from 'joi'

const orderDishSchema = joi.object({
    id_dish:joi.number().required(),
    amount:joi.number().max(50).required()
})


export const orderCreateSchema = joi.object({
    ci: joi.number().integer().required(),
    name:joi.string().max(40).required(),
    address:joi.string().max(100).required(),
    localization:joi.string().max(100).required(),
    tlf:joi.string().max(30).required(),
    method:joi.string().max(30).required(),
    ref:joi.string().max(50).required(),
    order_type:joi.string().max(20).required(),
    order_dish: joi.array().items(orderDishSchema)
    }) 

export const idOrderSchema = joi.object( { 
    idOrder:joi.number().integer().required().messages( { 
        'number.base':'"id" must be a number',
        'number.integer': '"id" must be a integer',
        'any.required': '"id" is required' 
})
}) 

export const ciSchema = joi.object({
    ci: joi.number().integer().required().messages({
        'number.base': '"ci" must be a number',
        'number.integer': '"ci" must be an integer',
        'any.required': '"ci" is required'
    })
});
/*
 

/* 
"ci": 30348188,
    "address": "Puerto La Cruz",
    "localization": "Calle 4",
    "tlf": "02412323",
    "method": "zelle",
    "ref": 232323,
    "order_type": "Delivery",
    "order_dish": [
        {
            "id_dish": 1,
            "amount": 2
        },
        {
            "id_dish": 3,
            "amount": 1
        },
        {
            "amount": 2,
            "id_dish": 4
        },
        {
            "id_dish": 7,
            "amount": 1111
        }
    ]*/