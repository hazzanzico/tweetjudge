import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";
import { testnetBradbury } from "genlayer-js/chains";

export type AnalysisResult = {
  id: string;
  originalTweet: string;
  timestamp: string;
  viralityScore: number;
  backlashRisk: number;
  consensusDisagreement: number;
  audienceBreakdown: {
    agree: string;
    attack: string;
    ignore: string;
  };
  reasoningPoints: string[];
  validatorOpinions: { name: string; opinion: string; detail: string }[];
  improvedTweet: string;
  variants: { type: string; description: string; tweet: string }[];
};

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
console.log("Contract:", CONTRACT_ADDRESS);

export const client = createClient({
  chain: testnetBradbury,
});

const getPersistentAccount = () => {
  const stored = localStorage.getItem("tweetjudge_account_pk");
  if (stored && stored.length > 0) {
    try {
      return createAccount(stored as `0x${string}`);
    } catch (e) {
      console.error("Failed to load stored account, generating new one:", e);
      localStorage.removeItem("tweetjudge_account_pk");
    }
  }
  const pk = generatePrivateKey();
  localStorage.setItem("tweetjudge_account_pk", pk);
  return createAccount(pk);
};

const account = getPersistentAccount();
const USER_ADDRESS = account.address;

export function getUserAddress(): string {
  return USER_ADDRESS;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function analyzeTweetWithConsensus(
  tweet: string
): Promise<AnalysisResult> {
  if (!CONTRACT_ADDRESS) {
    throw new Error("VITE_CONTRACT_ADDRESS is not set in your .env file.");
  }

  try {
    // Call backend to submit sponsored transaction
    console.log("Submitting to backend:", API_URL);
    const submitResponse = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweet, userAddress: USER_ADDRESS }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(error.error || `Backend error: ${submitResponse.status}`);
    }

    const { hash } = await submitResponse.json();
    console.log("Transaction hash:", hash);

    // Use the built-in SDK method instead of manual polling
    const receipt = await client.waitForTransactionReceipt({
      hash: hash,
      status: TransactionStatus.ACCEPTED,
      retries: 100,
      interval: 5000,
    });

    console.log("Transaction receipt:", receipt);

    // Now read the result directly
    const newCount = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_history_count",
      args: [USER_ADDRESS],
    });

    const lastIndex = Number(newCount) - 1;

    const jsonResult = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_analysis_at",
      args: [USER_ADDRESS, String(lastIndex)],
    });

    if (!jsonResult) {
      throw new Error("Failed to retrieve analysis result.");
    }

    const rawData = JSON.parse(jsonResult as string);
    return transformToAnalysisResult(rawData, tweet);
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}

export async function getAnalysisHistory(): Promise<AnalysisResult[]> {
  if (!CONTRACT_ADDRESS) return [];

  try {
    const rawCount = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_history_count",
      args: [USER_ADDRESS],
    });

    const total = rawCount != null ? Number(rawCount) : 0;
    if (total === 0) return [];

    const history: AnalysisResult[] = [];
    const limit = Math.min(total, 10);

    for (let i = total - 1; i >= Math.max(0, total - limit); i--) {
      try {
        const jsonResult = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_analysis_at",
          args: [USER_ADDRESS, String(i)],
        });
        if (jsonResult) {
          const rawData = JSON.parse(jsonResult as string);
          history.push(
            transformToAnalysisResult(rawData, rawData.tweet || "")
          );
        }
      } catch (e) {
        console.error(`Failed to fetch history at index ${i}`, e);
      }
    }

    return history;
  } catch (e) {
    console.error("Failed to fetch history:", e);
    return [];
  }
}

function transformToAnalysisResult(
  record: any,
  originalTweet: string
): AnalysisResult {
  const data = record.data || record.analysis || record;

  return {
    id: record.id || Math.random().toString(36).slice(2),
    originalTweet: originalTweet || record.tweet || "",
    timestamp: record.timestamp || new Date().toISOString(),
    viralityScore: Number(data.virality_score) || 0,
    backlashRisk: Number(data.backlash_risk) || 0,
    consensusDisagreement: Number(data.consensus_disagreement) || 0,
    audienceBreakdown: {
      agree: data.audience_breakdown?.agree || "Unknown",
      attack: data.audience_breakdown?.attack || "Unknown",
      ignore: data.audience_breakdown?.ignore || "Unknown",
    },
    reasoningPoints: data.reasoning_points || [],
    validatorOpinions: data.validator_opinions || [
      {
        name: "Risk Analyst",
        opinion: "Concerned",
        detail: "Potential backlash triggers detected.",
      },
      {
        name: "Engagement Expert",
        opinion: "Optimistic",
        detail: "Strong engagement potential.",
      },
    ],
    improvedTweet: data.improved_tweet || data.summary || "",
    variants: (data.variants || []).map((v: any) => ({
      type: v.type,
      description: v.description,
      tweet: v.tweet,
    })),
  };
}