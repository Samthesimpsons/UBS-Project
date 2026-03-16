import type { ChatMessageResponse } from "@/types/api";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  message: ChatMessageResponse;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.content}>{message.content}</div>
      <time className={styles.timestamp}>
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
    </div>
  );
}
