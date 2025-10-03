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
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        bio: "Experienced portfolio manager with 10+ years in cryptocurrency trading and investment strategies.",
        phone: "+84-123-456-789",
        address: "123 Blockchain Street, Crypto District",
        dateOfBirth: new Date("1985-05-15"),
        country: "Vietnam",
        city: "Ho Chi Minh City",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop",
        socialLinks: {
          twitter: "https://twitter.com/portfolioadmin",
          linkedin: "https://linkedin.com/in/portfolioadmin",
          github: "https://github.com/portfolioadmin",
          website: "https://portfolioadmin.com"
        },
        preferences: {
          currency: "USD",
          language: "en",
          theme: "dark",
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        role: "admin",
        isActive: true,
        isVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user1@example.com",
        username: "cryptotrader",
        password: await AuthUtils.hashPassword("password123"),
        fullName: "Crypto Trader",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        bio: "Active day trader specializing in altcoins and DeFi protocols. Always looking for the next big opportunity.",
        phone: "+84-987-654-321",
        address: "456 Trading Avenue, Financial District",
        dateOfBirth: new Date("1992-08-22"),
        country: "Vietnam",
        city: "Hanoi",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop",
        socialLinks: {
          twitter: "https://twitter.com/cryptotrader",
          github: "https://github.com/cryptotrader"
        },
        preferences: {
          currency: "VND",
          language: "vi",
          theme: "dark",
          notifications: {
            email: true,
            push: true,
            sms: true
          }
        },
        role: "user",
        isActive: true,
        isVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user2@example.com",
        username: "investor",
        password: await AuthUtils.hashPassword("mypassword"),
        fullName: "Long Term Investor",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        bio: "Conservative investor focused on long-term growth and building generational wealth through cryptocurrency.",
        phone: "+84-555-123-456",
        address: "789 Investment Boulevard, Capital City",
        dateOfBirth: new Date("1988-12-10"),
        country: "Vietnam",
        city: "Da Nang",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        coverImage: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&h=400&fit=crop",
        socialLinks: {
          linkedin: "https://linkedin.com/in/longtermtinvestor",
          website: "https://investmentblog.com"
        },
        preferences: {
          currency: "USD",
          language: "en",
          theme: "light",
          notifications: {
            email: true,
            push: false,
            sms: false
          }
        },
        role: "user",
        isActive: true,
        isVerified: false,
        lastLoginAt: new Date(),
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
        logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
        coinGeckoId: "bitcoin",
        marketCap: 1300000000000,
        rank: 1,
        volume24h: 25000000000,
        priceChange24h: 2.5,
        priceChange7d: 8.2,
        allTimeHigh: 69000,
        allTimeLow: 3200,
        circulatingSupply: 19500000,
        totalSupply: 19500000,
        maxSupply: 21000000,
        website: "https://bitcoin.org",
        whitepaper: "https://bitcoin.org/bitcoin.pdf",
        explorer: "https://blockchair.com/bitcoin",
        github: "https://github.com/bitcoin/bitcoin",
        category: "Layer 1",
        tags: ["proof-of-work", "store-of-value", "digital-gold"],
        description: "Bitcoin is the world's first cryptocurrency and remains the most valuable and widely recognized digital asset.",
        riskLevel: "MEDIUM",
        investmentGoal: "LONG_TERM",
        alertSettings: {
          priceTargetHigh: 75000,
          priceTargetLow: 60000,
          percentageChangeAlert: 10
        },
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
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        coinGeckoId: "ethereum",
        marketCap: 450000000000,
        rank: 2,
        volume24h: 15000000000,
        priceChange24h: 1.8,
        priceChange7d: 12.5,
        allTimeHigh: 4800,
        allTimeLow: 80,
        circulatingSupply: 120000000,
        totalSupply: 120000000,
        maxSupply: null,
        website: "https://ethereum.org",
        whitepaper: "https://ethereum.org/whitepaper/",
        explorer: "https://etherscan.io",
        github: "https://github.com/ethereum/go-ethereum",
        category: "Smart Contract Platform",
        tags: ["smart-contracts", "defi", "nft", "proof-of-stake"],
        description: "Ethereum is a decentralized platform that runs smart contracts and serves as the foundation for decentralized applications.",
        riskLevel: "MEDIUM",
        investmentGoal: "LONG_TERM",
        alertSettings: {
          priceTargetHigh: 5000,
          priceTargetLow: 3000,
          percentageChangeAlert: 15
        },
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
        logo: "https://cryptologos.cc/logos/cardano-ada-logo.png",
        coinGeckoId: "cardano",
        marketCap: 15000000000,
        rank: 8,
        volume24h: 800000000,
        priceChange24h: -2.1,
        priceChange7d: -5.8,
        allTimeHigh: 3.10,
        allTimeLow: 0.02,
        circulatingSupply: 35000000000,
        totalSupply: 45000000000,
        maxSupply: 45000000000,
        website: "https://cardano.org",
        whitepaper: "https://cardano.org/research/",
        explorer: "https://cardanoscan.io",
        github: "https://github.com/input-output-hk/cardano-node",
        category: "Layer 1",
        tags: ["proof-of-stake", "academic-research", "sustainability"],
        description: "Cardano is a research-driven blockchain platform focused on sustainability, scalability, and transparency.",
        riskLevel: "HIGH",
        investmentGoal: "LONG_TERM",
        alertSettings: {
          priceTargetHigh: 1.0,
          priceTargetLow: 0.3,
          percentageChangeAlert: 20
        },
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
        logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
        coinGeckoId: "solana",
        marketCap: 80000000000,
        rank: 5,
        volume24h: 3000000000,
        priceChange24h: 5.2,
        priceChange7d: 18.7,
        allTimeHigh: 260,
        allTimeLow: 0.50,
        circulatingSupply: 450000000,
        totalSupply: 580000000,
        maxSupply: null,
        website: "https://solana.com",
        whitepaper: "https://solana.com/solana-whitepaper.pdf",
        explorer: "https://solscan.io",
        github: "https://github.com/solana-labs/solana",
        category: "Layer 1",
        tags: ["high-throughput", "proof-of-stake", "defi", "nft"],
        description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.",
        riskLevel: "HIGH",
        investmentGoal: "MEDIUM_TERM",
        alertSettings: {
          priceTargetHigh: 250,
          priceTargetLow: 150,
          percentageChangeAlert: 15
        },
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
        logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
        coinGeckoId: "bitcoin",
        marketCap: 1300000000000,
        rank: 1,
        category: "Layer 1",
        tags: ["proof-of-work", "store-of-value"],
        description: "Bitcoin - Digital Gold",
        riskLevel: "MEDIUM",
        investmentGoal: "LONG_TERM",
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
        logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
        coinGeckoId: "dogecoin",
        marketCap: 12000000000,
        rank: 10,
        category: "Meme Coin",
        tags: ["meme", "community", "payments"],
        description: "The original meme cryptocurrency",
        riskLevel: "VERY_HIGH",
        investmentGoal: "SHORT_TERM",
        website: "https://dogecoin.com",
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
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        coinGeckoId: "ethereum",
        marketCap: 450000000000,
        rank: 2,
        category: "Smart Contract Platform",
        tags: ["smart-contracts", "defi", "nft"],
        description: "World Computer Platform",
        riskLevel: "MEDIUM",
        investmentGoal: "LONG_TERM",
        website: "https://ethereum.org",
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
        logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
        coinGeckoId: "binancecoin",
        marketCap: 80000000000,
        rank: 4,
        category: "Exchange Token",
        tags: ["exchange", "utility", "binance-ecosystem"],
        description: "Binance ecosystem utility token",
        riskLevel: "MEDIUM",
        investmentGoal: "MEDIUM_TERM",
        website: "https://www.binance.com",
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
        logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
        coinGeckoId: "matic-network",
        marketCap: 9000000000,
        rank: 15,
        category: "Layer 2",
        tags: ["layer-2", "scaling", "ethereum-ecosystem"],
        description: "Ethereum scaling and infrastructure development platform",
        riskLevel: "HIGH",
        investmentGoal: "MEDIUM_TERM",
        website: "https://polygon.technology",
        alertSettings: {
          priceTargetHigh: 2.0,
          priceTargetLow: 0.5,
          percentageChangeAlert: 25
        },
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
