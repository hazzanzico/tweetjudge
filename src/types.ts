export interface ValidatorOpinion {
  name: string;
  opinion: 'High Risk' | 'Moderate Risk' | 'Low Risk' | 'Safe';
  detail: string;
}

export interface TweetVariant {
  type: 'Safe' | 'Balanced' | 'Spicy' | 'Nuclear';
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
