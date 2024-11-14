import { app, InvocationContext, Timer } from "@azure/functions";
import {ScrapingService} from "../scraper_service";
import { MongoClient } from "mongodb";
import {DataService} from "../data_service/data_service";

const dbUri = "mongodb://uamarketplaceparserbyregens-server:vPgb0auf4W1Je6ya9olA81dx0JrTieoxnHNCtsk6xoWVmTizO25WOaY8WUhWFWf81fg7dWfaco4JACDbNmVkPg==@uamarketplaceparserbyregens-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@uamarketplaceparserbyregens-server@";

export async function scrapMarketplacesTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
    const scraper = new ScrapingService();
    const dataService = new DataService();
    let scrapedData:Product[] =[];
    const getScrapedData =(async () => {
        scrapedData = await scraper.scrapData();
        let data = dataService.getFormattedData(scrapedData, ['ATB','Фора','Сільпо','Новус']);
        return data;
    });
    const data = await getScrapedData();
    const mongoClient = new MongoClient(dbUri);
    await mongoClient.startSession();
    let collection =  await mongoClient.db('uamarketplaceparserbyregens-database').collection('marketplacesProducts');
    if( await collection.find().count() > 0){
        await collection.drop();
    }
    context.log('scucess');
    await collection.insertOne(data);
}



app.timer('scrapMarketplacesTrigger', {
    // schedule: '0 */5 * * * *',
    schedule: '0 * * * * *',
    handler: scrapMarketplacesTrigger
});
