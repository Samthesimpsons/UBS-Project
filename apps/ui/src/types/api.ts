export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  created_at: string;
}

export interface ChatMessageRequest {
  content: string;
}

export interface ChatMessageResponse {
  message_id: string;
  session_id: string;
  role: string;
  content: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatSessionCreate {
  title?: string;
}

export interface ChatSessionUpdate {
  title?: string;
  is_archived?: boolean;
}

export interface ChatSessionResponse {
  session_id: string;
  user_id: string;
  title: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  messages: ChatMessageResponse[];
}

export interface ChatSessionSummary {
  session_id: string;
  title: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatCompletionResponse {
  message: ChatMessageResponse;
  agent_trace: Record<string, unknown> | null;
}
