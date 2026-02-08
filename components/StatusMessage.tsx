"use client";

import { useEffect } from "react";

export interface StatusMessageData {
  type: "success" | "error" | "info";
  text: string;
  details?: string[];
}

interface StatusMessageProps {
  message: StatusMessageData | null;
  onDismiss: () => void;
}

const STYLES = {
  success: "bg-green-950 border-green-700 text-green-200",
  error: "bg-red-950 border-red-700 text-red-200",
  info: "bg-blue-950 border-blue-700 text-blue-200",
};

export default function StatusMessage({
  message,
  onDismiss,
}: StatusMessageProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${STYLES[message.type]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p>{message.text}</p>
          {message.details && message.details.length > 0 && (
            <ul className="mt-1 text-sm opacity-80">
              {message.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 opacity-60 hover:opacity-100 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
