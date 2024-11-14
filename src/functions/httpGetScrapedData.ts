import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {MongoClient} from 'mongodb';

export async function httpGetScrapedData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    console.log('request');
        let data = await dataBase();
        console.log(data);
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
};

app.http('httpGetScrapedData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpGetScrapedData
});

const dataBase = async () => {
    const uri = "mongodb://uamarketplaceparserbyregens-server:vPgb0auf4W1Je6ya9olA81dx0JrTieoxnHNCtsk6xoWVmTizO25WOaY8WUhWFWf81fg7dWfaco4JACDbNmVkPg==@uamarketplaceparserbyregens-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@uamarketplaceparserbyregens-server@";
    const mongoClient = new MongoClient(uri);
    console.log('Connected to database');
    await mongoClient.startSession();
    let collection =  await mongoClient.db('uamarketplaceparserbyregens-database').collection('marketplacesProducts');
    let data = await collection.find().toArray();
    await mongoClient.close();
    return data;
}