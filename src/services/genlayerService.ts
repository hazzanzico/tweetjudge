import { createClient, createAccount } from 'genlayer-js';

/**
 * Local fallback type to avoid breaking if ./types is missing
 * (you can replace this with an import later)
 */
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

const RPC_URL =
  import.meta.env.VITE_GENLAYER_RPC_URL ||
  'https://rpc-bradbury.genlayer.com';

// fixed typo fallback (ADDRES → ADDRESS)
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  import.meta.env.VITE_CONTRACT_ADDRES;

export const client = createClient({
  endpoint: RPC_URL,
});

// Persist account
const getPersistentAccount = () => {
  const stored = localStorage.getItem('tweetjudge_account_pk');

  if (stored) {
    try {
      return createAccount(stored as any);
    } catch (e) {
      console.error('Failed to load stored account', e);
    }
  }

  const newAcc = createAccount();
  localStorage.setItem(
    'tweetjudge_account_pk',
    (newAcc as any).privateKey || ''
  );
  return newAcc;
};

const account = getPersistentAccount();
const USER_ADDRESS = account.address;

export async function analyzeTweetWithConsensus(
  tweet: string
): Promise<AnalysisResult> {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'VITE_CONTRACT_ADDRESS is not set. Add it to your .env file.'
    );
  }

  try {
    // 1. Send transaction
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'analyze_tweet',
      args: [tweet],
      account,
      value: 0n, // ✅ FIXED (required)
    });

    // 2. Wait for receipt
    const receipt = await client.waitForTransactionReceipt({
      hash,
      status: 'ACCEPTED' as any, // ✅ FIXED typing issue
      retries: 300,
      interval: 4000,
    });

    // 3. Fetch result
    let count = 0n;

    for (let i = 0; i < 5; i++) {
      const rawCount = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_history_count',
        args: [USER_ADDRESS],
      });

      count = BigInt(rawCount as any);
      if (count > 0n) break;

      await new Promise((r) => setTimeout(r, 2000));
    }

    if (count === 0n) {
      throw new Error(
        'Analysis succeeded but record not found yet. Try again shortly.'
      );
    }

    const lastIndex = Number(count) - 1;

    const jsonResult = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_analysis_at',
      args: [USER_ADDRESS, lastIndex],
    });

    if (!jsonResult) {
      throw new Error('Failed to retrieve analysis JSON');
    }

    const rawData = JSON.parse(jsonResult as string);
    return transformToAnalysisResult(rawData, tweet);
  } catch (error: any) {
    console.error('Analysis Error:', error);
    throw error;
  }
}

export async function getAnalysisHistory(): Promise<AnalysisResult[]> {
  if (!CONTRACT_ADDRESS) return [];

  try {
    const count = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_history_count',
      args: [USER_ADDRESS],
    });

    const history: AnalysisResult[] = [];
    const total = Number(count);
    const limit = Math.min(total, 10);

    for (let i = total - 1; i >= Math.max(0, total - limit); i--) {
      try {
        const jsonResult = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: 'get_analysis_at',
          args: [USER_ADDRESS, i],
        });

        if (jsonResult) {
          const rawData = JSON.parse(jsonResult as string);
          history.push(
            transformToAnalysisResult(
              rawData,
              rawData.original_tweet || ''
            )
          );
        }
      } catch (e) {
        console.error(`Failed at index ${i}`, e);
      }
    }

    return history;
  } catch (e) {
    console.error('Failed to get history:', e);
    return [];
  }
}

function transformToAnalysisResult(
  record: any,
  originalTweet: string
): AnalysisResult {
  const data = record.data || record;

  return {
    id: record.id || Math.random().toString(36).slice(2),
    originalTweet: originalTweet || record.original_tweet || '',
    timestamp: record.timestamp || new Date().toISOString(),
    viralityScore: data.virality_score || 0,
    backlashRisk: data.backlash_risk || 0,
    consensusDisagreement: data.consensus_disagreement || 0,
    audienceBreakdown: {
      agree: data.audience_breakdown?.agree || 'Unknown',
      attack: data.audience_breakdown?.attack || 'Unknown',
      ignore: data.audience_breakdown?.ignore || 'Unknown',
    },
    reasoningPoints: data.reasoning_points || [],
    validatorOpinions:
      data.validator_opinions || [
        {
          name: 'Risk Analyst',
          opinion: 'Concerned',
          detail: 'Potential backlash triggers detected.',
        },
        {
          name: 'Engagement Expert',
          opinion: 'Optimistic',
          detail: 'Strong engagement potential.',
        },
      ],
    improvedTweet: data.improved_tweet || '',
    variants: (data.variants || []).map((v: any) => ({
      type: v.type,
      description: v.description,
      tweet: v.tweet,
    })),
  };
}