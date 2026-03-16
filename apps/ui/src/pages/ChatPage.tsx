import { useCallback, useEffect, useState } from "react";
import type { UserProfile, ChatSessionSummary, ChatSessionResponse, ChatMessageResponse } from "@/types/api";
import { createSession, deleteSession, getSession, listSessions, sendMessage, updateSession } from "@/api/client";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import styles from "./ChatPage.module.css";

interface ChatPageProps {
  user: UserProfile;
  onLogout: () => void;
}

export function ChatPage({ user, onLogout }: ChatPageProps) {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const result = await listSessions();
      setSessions(result);
    } catch {
      /* session list load failed silently */
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const session: ChatSessionResponse = await getSession(sessionId);
      setMessages(session.messages);
    } catch {
      setMessages([]);
    }
  }, []);

  const handleNewSession = useCallback(async () => {
    try {
      const session = await createSession({ title: "New Chat" });
      setActiveSessionId(session.session_id);
      setMessages([]);
      await loadSessions();
    } catch {
      /* session creation failed silently */
    }
  }, [loadSessions]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch {
      /* session deletion failed silently */
    }
  }, [activeSessionId, loadSessions]);

  const handleRenameSession = useCallback(async (sessionId: string, title: string) => {
    try {
      await updateSession(sessionId, { title });
      await loadSessions();
    } catch {
      /* rename failed silently */
    }
  }, [loadSessions]);

  const handleArchiveSession = useCallback(async (sessionId: string) => {
    try {
      await updateSession(sessionId, { is_archived: true });
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch {
      /* archive failed silently */
    }
  }, [activeSessionId, loadSessions]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeSessionId || isSending) return;

    const userMessage: ChatMessageResponse = {
      message_id: crypto.randomUUID(),
      session_id: activeSessionId,
      role: "user",
      content,
      context: null,
      created_at: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setIsSending(true);

    try {
      const response = await sendMessage(activeSessionId, { content });
      setMessages((previous) => [...previous, response.message]);
      await loadSessions();
    } catch {
      const errorMessage: ChatMessageResponse = {
        message_id: crypto.randomUUID(),
        session_id: activeSessionId,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        context: null,
        created_at: new Date().toISOString(),
      };
      setMessages((previous) => [...previous, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }, [activeSessionId, isSending, loadSessions]);

  return (
    <div className={styles.layout}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isLoading={isLoadingSessions}
        user={user}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onArchiveSession={handleArchiveSession}
        onLogout={onLogout}
      />
      <ChatWindow
        messages={messages}
        isSending={isSending}
        hasActiveSession={activeSessionId !== null}
        onSendMessage={handleSendMessage}
        onNewSession={handleNewSession}
      />
    </div>
  );
}
