import type {
  ChatCompletionResponse,
  ChatMessageRequest,
  ChatSessionCreate,
  ChatSessionResponse,
  ChatSessionSummary,
  ChatSessionUpdate,
  LoginRequest,
  TokenResponse,
  UserProfile,
} from "@/types/api";

const BASE_URL = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<TokenResponse>(response);
}

export async function getProfile(): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<UserProfile>(response);
}

export async function createSession(request?: ChatSessionCreate): Promise<ChatSessionResponse> {
  const response = await fetch(`${BASE_URL}/chat/sessions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request ?? {}),
  });
  return handleResponse<ChatSessionResponse>(response);
}

export async function listSessions(includeArchived = false): Promise<ChatSessionSummary[]> {
  const params = new URLSearchParams();
  if (includeArchived) params.set("include_archived", "true");
  const response = await fetch(`${BASE_URL}/chat/sessions?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ChatSessionSummary[]>(response);
}

export async function getSession(sessionId: string): Promise<ChatSessionResponse> {
  const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ChatSessionResponse>(response);
}

export async function updateSession(
  sessionId: string,
  request: ChatSessionUpdate
): Promise<ChatSessionResponse> {
  const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse<ChatSessionResponse>(response);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

export async function sendMessage(
  sessionId: string,
  request: ChatMessageRequest
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse<ChatCompletionResponse>(response);
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${BASE_URL}/health`);
  return handleResponse<{ status: string }>(response);
}
