import  {Response,Request}  from "express";
import { stadisticsHelper } from "../helpers/stadisticsHelpers";
import  { baseResponse} from '../messages/messagesRes';


export class stadisticsController { 
    private stadisticsHelper:stadisticsHelper;
    private baseResponse:baseResponse;
    constructor() {
        this.stadisticsHelper = new stadisticsHelper();
        this.baseResponse = new baseResponse();

    } 

    public  stadistcAdmin = async(req:Request,res:Response) =>  { 
        try{
            const clients = await this.stadisticsHelper.countClients();

            this.baseResponse.sendResponse(res,200,'Ok',clients)

        }catch(err) {
            console.error(err)
            this.baseResponse[400](res,'Error')
        }
    }
}