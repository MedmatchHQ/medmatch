import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import "reflect-metadata";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close(); 
  await mongoServer.stop();
});

jest.setTimeout(30000);
