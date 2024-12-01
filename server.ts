import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import routerUser  from './REST/routers/userRouter'
import routerDish from './REST/routers/dishRouter'
import { Server as serverSocket }   from 'socket.io'
import {dishRequest} from './socket/router/dishRouter'
import {orderEvents} from './socket/router/orderRouter'
import http from 'http'
import NodeCache from 'node-cache';
// Configura dotenv
config();

// Opciones de CORS
const corsOptions = {
    origin: true, // all ip
    credentials: true,  // credentials
};

export class Server {
    private app: express.Application;
    private port: string | number;
    private path: { [key: string]: string };
    private io:serverSocket;
    private server: http.Server;
    private cache:NodeCache
    constructor(cache:NodeCache) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.path = {
            api: "/api/v1",
        };
        this.cache = cache;
        
         this.server = http.createServer(this.app);
         this.io = new serverSocket(this.server, {
             cors: corsOptions
         });
         this.socketEvents();
         this.middleware();
        this.routes();
        
    }
   
    private middleware() {
        this.app.use(express.json());
        this.app.use(morgan('dev'));
        this.app.use(cors(corsOptions));
        this.app.use(cookieParser());
    }

    private socketEvents() {
        
        this.io.on('connection', (socket) => {
            console.log('socket connected', socket.id);
         
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });

        dishRequest(socket,this.io);
        orderEvents(socket,this.io);

        }
      );
    }
    
    private routes() { 
        this.app.use(`${this.path.api}`, routerUser);
        this.app.use(`${this.path.api}`, routerDish)
    }

    public listen() {
        this.server.listen(this.port, () => {
            console.log('Server running on port:', this.port);
        });
    }
}
