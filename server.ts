import express from "express";
import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;

if (!CONTRACT_ADDRESS) {
  throw new Error("VITE_CONTRACT_ADDRESS is not set in .env");
}

if (!SPONSOR_PRIVATE_KEY) {
  throw new Error("SPONSOR_PRIVATE_KEY is not set in .env");
}

const client = createClient({
  chain: testnetBradbury,
});

const sponsorAccount = createAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { tweet, userAddress } = req.body;

    if (!tweet || typeof tweet !== "string") {
      return res.status(400).json({ error: "Tweet text is required" });
    }

    if (!userAddress) {
      return res.status(400).json({ error: "User address is required" });
    }

    console.log(`[${new Date().toISOString()}] Analyzing for ${userAddress}: ${tweet.substring(0, 50)}...`);

    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "analyze_tweet",
      args: [tweet, userAddress],  // Pass user address to contract
      account: sponsorAccount,  // Sponsor pays gas
      value: 0n,
    });

    console.log(`[${new Date().toISOString()}] Transaction: ${hash}`);
    res.json({ success: true, hash });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error?.message || "Analysis failed" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", sponsor: sponsorAccount.address });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Sponsored transaction server running on port ${PORT}`);
  console.log(`Sponsor account: ${sponsorAccount.address}`);
});
