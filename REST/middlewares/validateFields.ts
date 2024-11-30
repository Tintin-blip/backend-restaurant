import {validationResult } from 'express-validator'

export const validateFields = ( req:any, res:any, next:any ) => {
    const errors = validationResult(req);
    
    if( !errors.isEmpty() ){
        return res.status(400).json({
            status:'Error validateFields',
            errors
        });
    };

    next();
};


