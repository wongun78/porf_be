import clientPromise from "./src/lib/mongodb";
import { AuthUtils } from "./src/lib/utils";

async function seedDatabase() {
  try {
    console.log("🌱 Bắt đầu seed database Portfolio Tracker...");

    const client = await clientPromise;
    const db = client.db("hocdanit");

    // Clear existing data (optional - uncomment if you want to reset)
    // await db.collection('coins').deleteMany({})
    // await db.collection('users').deleteMany({})
    // console.log('🗑️  Đã xóa dữ liệu cũ')

    // Seed Users data first
    const usersData = [
      {
        email: "admin@hocdanit.com",
        username: "admin",
        password: await AuthUtils.hashPassword("123456"),
        fullName: "Portfolio Admin",
        avatar: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user1@example.com",
        username: "cryptotrader",
        password: await AuthUtils.hashPassword("password123"),
        fullName: "Crypto Trader",
        avatar: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user2@example.com",
        username: "investor",
        password: await AuthUtils.hashPassword("mypassword"),
        fullName: "Long Term Investor",
        avatar: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert users
    const usersResult = await db.collection("users").insertMany(usersData);
    console.log(`✅ Đã insert ${usersResult.insertedCount} users`);

    // Get user IDs for coin data
    const adminId = usersResult.insertedIds[0];
    const user1Id = usersResult.insertedIds[1];
    const user2Id = usersResult.insertedIds[2];

    // Seed Coins data for Portfolio Tracking
    const coinsData = [
      // Admin's portfolio
      {
        userId: adminId,
        symbol: "BTC",
        name: "Bitcoin",
        quantity: 0.5,
        averageBuyPrice: 45000,
        currentPrice: 67000,
        totalInvested: 22500,
        currentValue: 33500,
        profitLoss: 11000,
        profitLossPercentage: 48.89,
        note: "DCA strategy, long term hold",
        purchaseDate: new Date("2023-01-15"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: adminId,
        symbol: "ETH",
        name: "Ethereum",
        quantity: 10,
        averageBuyPrice: 2500,
        currentPrice: 3800,
        totalInvested: 25000,
        currentValue: 38000,
        profitLoss: 13000,
        profitLossPercentage: 52.0,
        note: "Believe in smart contracts future",
        purchaseDate: new Date("2023-02-10"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: adminId,
        symbol: "ADA",
        name: "Cardano",
        quantity: 5000,
        averageBuyPrice: 0.8,
        currentPrice: 0.45,
        totalInvested: 4000,
        currentValue: 2250,
        profitLoss: -1750,
        profitLossPercentage: -43.75,
        note: "Research focused blockchain",
        purchaseDate: new Date("2023-03-05"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: adminId,
        symbol: "SOL",
        name: "Solana",
        quantity: 50,
        averageBuyPrice: 80,
        currentPrice: 180,
        totalInvested: 4000,
        currentValue: 9000,
        profitLoss: 5000,
        profitLossPercentage: 125.0,
        note: "Fast and scalable blockchain",
        purchaseDate: new Date("2023-04-20"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // User1's portfolio
      {
        userId: user1Id,
        symbol: "BTC",
        name: "Bitcoin",
        quantity: 0.25,
        averageBuyPrice: 50000,
        currentPrice: 67000,
        totalInvested: 12500,
        currentValue: 16750,
        profitLoss: 4250,
        profitLossPercentage: 34.0,
        note: "Started with small amount",
        purchaseDate: new Date("2023-06-01"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user1Id,
        symbol: "DOGE",
        name: "Dogecoin",
        quantity: 10000,
        averageBuyPrice: 0.15,
        currentPrice: 0.08,
        totalInvested: 1500,
        currentValue: 800,
        profitLoss: -700,
        profitLossPercentage: -46.67,
        note: "YOLO meme coin investment",
        purchaseDate: new Date("2023-05-15"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // User2's portfolio
      {
        userId: user2Id,
        symbol: "ETH",
        name: "Ethereum",
        quantity: 5,
        averageBuyPrice: 3000,
        currentPrice: 3800,
        totalInvested: 15000,
        currentValue: 19000,
        profitLoss: 4000,
        profitLossPercentage: 26.67,
        note: "Conservative investment in ETH",
        purchaseDate: new Date("2023-07-10"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user2Id,
        symbol: "BNB",
        name: "Binance Coin",
        quantity: 20,
        averageBuyPrice: 300,
        currentPrice: 520,
        totalInvested: 6000,
        currentValue: 10400,
        profitLoss: 4400,
        profitLossPercentage: 73.33,
        note: "Binance ecosystem play",
        purchaseDate: new Date("2023-08-05"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user2Id,
        symbol: "MATIC",
        name: "Polygon",
        quantity: 2000,
        averageBuyPrice: 1.2,
        currentPrice: 0.9,
        totalInvested: 2400,
        currentValue: 1800,
        profitLoss: -600,
        profitLossPercentage: -25.0,
        note: "Layer 2 scaling solution",
        purchaseDate: new Date("2023-09-01"),
        lastPriceUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert coins
    const coinsResult = await db.collection("coins").insertMany(coinsData);
    console.log(`✅ Đã insert ${coinsResult.insertedCount} coins`);

    // Create indexes for better performance
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("coins").createIndex({ userId: 1, symbol: 1 });
    await db.collection("coins").createIndex({ userId: 1, isActive: 1 });

    console.log("🎉 Seed database hoàn thành!");
    console.log("📋 Sample accounts:");
    console.log("   Email: admin@hocdanit.com | Password: 123456");
    console.log("   Email: user1@example.com | Password: password123");
    console.log("   Email: user2@example.com | Password: mypassword");
  } catch (error) {
    console.error("❌ Seed database thất bại:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
