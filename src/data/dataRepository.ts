import { MongoClient } from 'mongodb';
import { Data } from './types';
import { WithId } from 'mongodb';

export const getData = async (): Promise<WithId<Data>[]> => {
  const mongoClient = new MongoClient(process.env.DB_URI);
  mongoClient.startSession();
  const collection = mongoClient.db(process.env.DB_NAME).collection<Data>(process.env.COLLECTION_NAME);
  const data = await collection.find().toArray();
  await mongoClient.close();
  return data;
};

export const saveData = async (data: Data): Promise<void> => {
  const mongoClient = new MongoClient(process.env.DB_URI);
  mongoClient.startSession();
  const collection = mongoClient.db(process.env.DB_NAME).collection(process.env.COLLECTION_NAME);
  await collection.insertOne(data);
  await mongoClient.close();
};
