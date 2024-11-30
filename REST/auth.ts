import bcrypt from 'bcrypt'

export class Auth { 
    
    public async passwordMatch  (password:string,userPassword:any) { 
        const isPasswordCorrect  = await bcrypt.compare(password, userPassword);
        console.log(isPasswordCorrect)
        if (!isPasswordCorrect) {
            throw new Error('Password not match');
        }
    }
    public  generateHash = async (password:string) => {
        const saltRounds = 10;
        const hashedPassword:any = bcrypt.hash(password, saltRounds);
        return hashedPassword
      };

    
    
}
