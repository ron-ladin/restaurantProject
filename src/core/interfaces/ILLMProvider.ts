import { UserPreference, Restaurant } from "../domain/types.js";

export interface AgentMessage {
  agentName: string;
  thought: string;
  speech: string;
}

export interface NegotiationResult {
  finalRestaurantId: string | null;
  consensusReached: boolean;
  satisfactionScores: Record<string, number>; // 1-10
  transcript: AgentMessage[];
  summary: string;
}

export interface NegotiationRequest {
  users: UserPreference[];
  candidates: Restaurant[];
}

export interface ILLMProvider {
  negotiate(request: NegotiationRequest): Promise<NegotiationResult>;
}
