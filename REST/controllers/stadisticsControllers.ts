import  {Response,Request}  from "express";
import { StadisticsHelper } from "../helpers/stadisticsHelpers";
import  { BaseResponse} from '../messages/messagesRes';


export class StadisticsController { 
    private stadisticsHelper:StadisticsHelper;
    private baseResponse:BaseResponse;
    constructor() {
        this.stadisticsHelper = new StadisticsHelper();
        this.baseResponse = new BaseResponse();

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