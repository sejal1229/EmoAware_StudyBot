
export enum EmotionType {
  POSITIVE = 'Positive Engagement',
  NEUTRAL = 'Neutral Focus',
  CONFUSED = 'Confusion',
  STRESSED = 'Stress/Frustration',
  SAD = 'Low Motivation',
  SURPRISED = 'Distraction',
  CALM = 'Calm/Balanced'
}

export interface AnalysisResult {
  emotion: EmotionType;
  confidence: number;
  guidance: string;
  timestamp: number;
  reasoning: string;
}

export interface SessionStats {
  timestamp: number;
  emotion: string;
}
