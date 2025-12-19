const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Set up before all tests
beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Close connections after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Set environment variables for testing
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRE = "1d";
process.env.NODE_ENV = "test";
