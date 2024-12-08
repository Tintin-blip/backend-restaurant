import express, {Request, request,Response,response } from 'express';
import { UserHelper} from '../helpers/userHelpers';
import { User } from '../../domain/models/interfaces';
import {  baseResponse } from '../messages/messagesRes';
import jwt from 'jsonwebtoken'
export class controlersUser  {
    private userService
    private baseResponse
    constructor() { 
        this.baseResponse = new baseResponse()
        this.userService = new UserHelper()
    }

    public createUserController  = async(req:Request,res:Response) => {
        const user:User = req.body
        try { 
        await  this.userService.createUser(user);

        this.baseResponse.sendResponse(res,201,'created');

        }catch(err:any) { 
            if(err.message == 'User already exist') { 
                this.baseResponse[400](res,err.message);
                return
            }
            this.baseResponse.handleError(res,'Server Error')
        } 
    }

    /*
    public  getUserByIdController = async(req:Request, res:Response) => {
    const id = parseInt(req.query.id as string)
        try { 
            const users = await  this.userService.getUserById(id);
            this.baseResponse.sendResponse(res,200,'ok',users);
        }catch(err) { 
            this.baseResponse.handleError(res,'Error')
        }
    }*/
    public  signInController = async(req:Request, res:Response) => {
        const data = req.body;
            try { 
            const rol  = await this.userService.getNameAndMatchPassword(data);
            const payload = { user:'user' }; // Ajustar campos según tu modelo de usuario
            const secretKey = process.env.JWT_SECRET || 'defaultSecretKey'; // Usar una clave secreta segura
            jwt.sign(payload, secretKey, { expiresIn: '5h' }); // Token válido por 1 hora
            

                this.baseResponse.sendResponse(res,200,'signed',rol);
            }catch(err:any) { 
                if(err.message== 'Users no exists') { 
                    this.baseResponse.unauthorized(res,err.message)
                    return
                }
                if(err.message == 'Password not match') { 
                    this.baseResponse.unauthorized(res,err.message)
                    return
                }
                this.baseResponse.handleError(res,'Error')

            }
            
        }
}
export  default controlersUser