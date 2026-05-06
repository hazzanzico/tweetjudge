export interface ValidatorOpinion {
  name: string;
  opinion: string; // relaxed from union — LLM returns dynamic values
  detail: string;
}

export interface TweetVariant {
  type: string; // relaxed from union — LLM returns dynamic values
  description: string;
  tweet: string;
}

export interface AnalysisResult {
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
  validatorOpinions: ValidatorOpinion[];
  improvedTweet: string;
  variants: TweetVariant[];
}