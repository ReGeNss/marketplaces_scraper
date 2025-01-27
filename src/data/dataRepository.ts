import { MongoClient } from 'mongodb';
import { Category, FormattedData } from './types';
import { WithId } from 'mongodb';

export const getData = async (collectionName: string): Promise<WithId<Category>[]> => {
  const mongoClient = new MongoClient(process.env.DB_CONNECTION_STRING);
  mongoClient.startSession();
  const collection = mongoClient.db(process.env.DB_NAME).collection<Category>(collectionName);
  const data = await collection.find().toArray();
  await mongoClient.close();
  return data;
};

export const saveData = async (data: FormattedData): Promise<void> => {
  const mongoClient = new MongoClient(process.env.DB_CONNECTION_STRING);
  mongoClient.startSession();
  for (const collectionName in data) {
    const collection = mongoClient.db(process.env.DB_NAME).collection(collectionName);
    await collection.drop();
    await collection.insertOne(data[collectionName]);
  }
  await mongoClient.close();
};

export const categories = [
  {
    'apiRoute': 'energy-drinks',
    'name': 'енергетики',
    'iconName': '0xeedd',
  },
  {
    'apiRoute': 'alcohol',
    'name': 'алкоголь',
    'iconName': '0xf4d2',
  },
  {
    'apiRoute': 'pelmeni',
    'name': 'пельмені',
    'iconName': '0xf315',
  },
  {
    'apiRoute': 'soda-drinks',
    'name': 'газовані напої',
    'iconName': '0xf179',
  },
];
