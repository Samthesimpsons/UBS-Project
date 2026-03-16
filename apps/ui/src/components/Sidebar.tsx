import { useState } from "react";
import type { ChatSessionSummary, UserProfile } from "@/types/api";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isLoading: boolean;
  user: UserProfile;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
  onArchiveSession: (sessionId: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  isLoading,
  user,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onArchiveSession,
  onLogout,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function handleStartRename(sessionId: string, currentTitle: string) {
    setEditingId(sessionId);
    setEditTitle(currentTitle);
  }

  function handleFinishRename(sessionId: string) {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <button className={styles.newChatButton} onClick={onNewSession}>
          + New Chat
        </button>
      </div>

      <nav className={styles.sessionList}>
        {isLoading ? (
          <p className={styles.loading}>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className={styles.empty}>No conversations yet</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.session_id}
              className={`${styles.sessionItem} ${
                activeSessionId === session.session_id ? styles.active : ""
              }`}
              onClick={() => onSelectSession(session.session_id)}
            >
              {editingId === session.session_id ? (
                <input
                  className={styles.renameInput}
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  onBlur={() => handleFinishRename(session.session_id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleFinishRename(session.session_id);
                    if (event.key === "Escape") setEditingId(null);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  autoFocus
                />
              ) : (
                <>
                  <span className={styles.sessionTitle}>{session.title}</span>
                  <div className={styles.sessionActions} onClick={(event) => event.stopPropagation()}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleStartRename(session.session_id, session.title)}
                      title="Rename"
                    >
                      R
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => onArchiveSession(session.session_id)}
                      title="Archive"
                    >
                      A
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => onDeleteSession(session.session_id)}
                      title="Delete"
                    >
                      X
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <span className={styles.displayName}>{user.display_name}</span>
          <span className={styles.username}>@{user.username}</span>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
