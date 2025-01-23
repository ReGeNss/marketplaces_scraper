import { MongoClient } from 'mongodb';
import { Data } from './types';
import { WithId } from 'mongodb';

export const getData = async (): Promise<WithId<Data>[]> => {
  const mongoClient = new MongoClient(process.env.DB_CONNECTION_STRING);
  mongoClient.startSession();
  const collection = mongoClient.db(process.env.DB_NAME).collection<Data>(process.env.DB_COLLECTION);
  const data = await collection.find().toArray();
  await mongoClient.close();
  return data;
};

export const saveData = async (data: Data): Promise<void> => {
  const mongoClient = new MongoClient(process.env.DB_CONNECTION_STRING);
  mongoClient.startSession();
  const collection = mongoClient.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);
  await collection.drop();
  await collection.insertOne(data);
  await mongoClient.close();
};
