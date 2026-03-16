import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessageResponse } from "@/types/api";
import { MessageBubble } from "@/components/MessageBubble";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  messages: ChatMessageResponse[];
  isSending: boolean;
  hasActiveSession: boolean;
  onSendMessage: (content: string) => void;
  onNewSession: () => void;
}

export function ChatWindow({
  messages,
  isSending,
  hasActiveSession,
  onSendMessage,
  onNewSession,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;
    onSendMessage(trimmed);
    setInputValue("");
  }

  if (!hasActiveSession) {
    return (
      <main className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Welcome to Customer Service</h2>
          <p>Start a new conversation to get help with your banking needs.</p>
          <button className={styles.startButton} onClick={onNewSession}>
            Start a Conversation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.messageList}>
        {messages.length === 0 && (
          <div className={styles.emptyChat}>
            <p>How can I help you today?</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.message_id} message={message} />
        ))}
        {isSending && (
          <div className={styles.typingIndicator}>
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isSending}
          autoFocus
        />
        <button className={styles.sendButton} type="submit" disabled={isSending || !inputValue.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
