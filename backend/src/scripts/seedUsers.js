require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const sampleUsers = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    password: "password123",
    role: "student",
    phone: "317-555-0101",
    address: "123 Main St",
    city: "Indianapolis",
    state: "IN",
    zipcode: "46201",
    isActive: true,
  },
  {
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    password: "password123",
    role: "faculty",
    phone: "317-555-0102",
    address: "456 Oak Ave",
    city: "Bloomington",
    state: "IN",
    zipcode: "47401",
    isActive: true,
  },
  {
    firstName: "Michael",
    lastName: "Williams",
    email: "michael.williams@example.com",
    password: "password123",
    role: "student",
    phone: "765-555-0103",
    address: "789 Elm St",
    city: "West Lafayette",
    state: "IN",
    zipcode: "47906",
    isActive: true,
  },
  {
    firstName: "Sarah",
    lastName: "Brown",
    email: "sarah.brown@example.com",
    password: "password123",
    role: "faculty",
    phone: "812-555-0104",
    address: "321 Pine Rd",
    city: "Carmel",
    state: "IN",
    zipcode: "46032",
    isActive: true,
  },
  {
    firstName: "David",
    lastName: "Jones",
    email: "david.jones@example.com",
    password: "password123",
    role: "student",
    phone: "317-555-0105",
    address: "654 Maple Dr",
    city: "Fishers",
    state: "IN",
    zipcode: "46038",
    isActive: true,
  },
  {
    firstName: "Jessica",
    lastName: "Garcia",
    email: "jessica.garcia@example.com",
    password: "password123",
    role: "admin",
    phone: "317-555-0106",
    address: "987 Cedar Ln",
    city: "Noblesville",
    state: "IN",
    zipcode: "46060",
    isActive: true,
  },
  {
    firstName: "Daniel",
    lastName: "Martinez",
    email: "daniel.martinez@example.com",
    password: "password123",
    role: "student",
    phone: "765-555-0107",
    address: "147 Birch St",
    city: "Lafayette",
    state: "IN",
    zipcode: "47901",
    isActive: true,
  },
  {
    firstName: "Ashley",
    lastName: "Rodriguez",
    email: "ashley.rodriguez@example.com",
    password: "password123",
    role: "faculty",
    phone: "812-555-0108",
    address: "258 Walnut Ave",
    city: "Evansville",
    state: "IN",
    zipcode: "47708",
    isActive: true,
  },
  {
    firstName: "Christopher",
    lastName: "Wilson",
    email: "christopher.wilson@example.com",
    password: "password123",
    role: "student",
    phone: "317-555-0109",
    address: "369 Spruce Ct",
    city: "Greenwood",
    state: "IN",
    zipcode: "46143",
    isActive: false,
  },
  {
    firstName: "Amanda",
    lastName: "Anderson",
    email: "amanda.anderson@example.com",
    password: "password123",
    role: "student",
    phone: "765-555-0110",
    address: "741 Ash Blvd",
    city: "Muncie",
    state: "IN",
    zipcode: "47302",
    isActive: true,
  },
  {
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@example.com",
    password: "password123",
    role: "faculty",
    phone: "317-555-0111",
    address: "852 Hickory Ln",
    city: "Indianapolis",
    state: "IN",
    zipcode: "46220",
    isActive: true,
  },
  {
    firstName: "Jennifer",
    lastName: "Thomas",
    email: "jennifer.thomas@example.com",
    password: "password123",
    role: "faculty",
    phone: "765-555-0112",
    address: "963 Willow Way",
    city: "West Lafayette",
    state: "IN",
    zipcode: "47906",
    isActive: true,
  },
  {
    firstName: "James",
    lastName: "Moore",
    email: "james.moore@example.com",
    password: "password123",
    role: "faculty",
    phone: "812-555-0113",
    address: "159 Poplar St",
    city: "Bloomington",
    state: "IN",
    zipcode: "47401",
    isActive: true,
  },
  {
    firstName: "Patricia",
    lastName: "Jackson",
    email: "patricia.jackson@example.com",
    password: "password123",
    role: "faculty",
    phone: "317-555-0114",
    address: "357 Magnolia Dr",
    city: "Carmel",
    state: "IN",
    zipcode: "46032",
    isActive: true,
  },
  {
    firstName: "William",
    lastName: "White",
    email: "william.white@example.com",
    password: "password123",
    role: "faculty",
    phone: "765-555-0115",
    address: "468 Dogwood Ct",
    city: "Lafayette",
    state: "IN",
    zipcode: "47901",
    isActive: true,
  },
  {
    firstName: "Linda",
    lastName: "Harris",
    email: "linda.harris@example.com",
    password: "password123",
    role: "faculty",
    phone: "812-555-0116",
    address: "579 Sycamore Ave",
    city: "Evansville",
    state: "IN",
    zipcode: "47708",
    isActive: true,
  },
  {
    firstName: "Richard",
    lastName: "Martin",
    email: "richard.martin@example.com",
    password: "password123",
    role: "faculty",
    phone: "317-555-0117",
    address: "680 Chestnut Blvd",
    city: "Fishers",
    state: "IN",
    zipcode: "46038",
    isActive: true,
  },
  {
    firstName: "Barbara",
    lastName: "Thompson",
    email: "barbara.thompson@example.com",
    password: "password123",
    role: "faculty",
    phone: "765-555-0118",
    address: "791 Redwood Rd",
    city: "Noblesville",
    state: "IN",
    zipcode: "46060",
    isActive: true,
  },
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
        skippedCount++;
        continue;
      }

      // Create user
      await User.create(userData);
      console.log(`✅ Created: ${userData.email} (${userData.role})`);
      createdCount++;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Created: ${createdCount} users`);
    console.log(`   Skipped: ${skippedCount} users (already exist)`);
    console.log(`   Total: ${sampleUsers.length} users processed`);
    console.log("=".repeat(50));
    console.log("\n💡 Default password for all sample users: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    process.exit(1);
  }
};

seedUsers();
