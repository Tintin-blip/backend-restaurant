
import { signIn, User } from '../../domain/models/interfaces'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import {Auth} from '../auth'
export class UserHelper  {
    private auth;
    constructor() { 
        this.auth = new Auth;
    }
    public async createUser(user: User) {
        const { name, password, rol} = user;

        // Validación manual
        if (!name || !password || !rol) {
            throw new Error('Todos los campos son requeridos');
        }
        
        const userExists = await prisma.users.findFirst({where: {name:name,password:password,rol:rol}})
        if(userExists?.id_user){ 
            throw new Error('User already exist')
        }

        const passwordHash:any = await this.auth.generateHash(password)
        try {
            await prisma.users.create( { 
                data: { 
                    name:name,
                    password:passwordHash,
                    rol:rol
                }
            }) 
        } catch (err:any) {
            console.error('Error al crear el usuario', err);
            throw err;
        }
    }

    public async getNameAndMatchPassword(signIn:signIn) { 
        try { 
            let {name,password} = signIn;
            const query = await prisma.users.findFirstOrThrow({where:{name:name},select: {password:true,rol:true},})
            if(query == null ){ 
                return Error('Users no exists')
            }
            this.auth.passwordMatch(password,query.password);
            return query.rol
            
        }catch(err:any) { 
            console.log(err)
            throw err
        }
       
    }
} 