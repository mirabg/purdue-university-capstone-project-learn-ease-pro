const mongoose = require("mongoose");
const connectDB = require("../src/config/database");

// Mock mongoose.connect
jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("Database Configuration", () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    processExitSpy = jest.spyOn(process, "exit").mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it("should connect to MongoDB successfully", async () => {
    const mockConnection = {
      connection: {
        host: "localhost",
      },
    };

    mongoose.connect.mockResolvedValue(mockConnection);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith("MongoDB Connected: localhost");
  });

  it("should handle connection errors and exit process", async () => {
    const error = new Error("Connection failed");
    mongoose.connect.mockRejectedValue(error);

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error: Connection failed");
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should use correct MongoDB URI from environment", async () => {
    const mockConnection = {
      connection: { host: "testhost" },
    };

    mongoose.connect.mockResolvedValue(mockConnection);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      process.env.MONGODB_URI,
      expect.objectContaining({
        useNewUrlParser: true,
      })
    );
  });
});
