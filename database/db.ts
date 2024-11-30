import {Pool} from 'pg'
import { config } from 'dotenv'

config();
export class DB { 
    private host: string;
    private user: string;
    private port: number;
    private password: string;
    private db_name: string;
    private pool: Pool;
    
    constructor () {
        this.host = process.env.POSTGRESQL_HOST || 'localhost'
        this.user = process.env.POSTGRESQL_USER || 'postgres'
        this.port = process.env.POSTGRESQL_PORT ? parseInt(process.env.POSTGRESQL_PORT) : 5432;
        this.password = process.env.POSTGRESQL_PASSWORD  || 'undefined'
        this.db_name = process.env.POSTGRESQL_DB_NAME || 'undefined'
        this.pool = new Pool({
            host: this.host,
            user: this.user,
            port: this.port,
            password: this.password,
            database: this.db_name
        });
    }

     public connect = async() => {
        try { 
            await this.pool.connect()
            console.log('Conexion exitosa')
        }catch(err){ 
            console.log('Error')
        }
     }
     public getPool() { 
        return this.pool;
     }
    
}


