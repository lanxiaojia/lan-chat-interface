import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type ChatStatus = "idle" | "sending" | "streaming" | "error";

class RetriableError extends Error {}
class FatalError extends Error {}

interface ChatOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  bodyBuilder?: (payload: {
    currentMessage: string;
    history: Omit<Message, "id">[];
  }) => any;
  // 🟢 优化 1: 移除了 onUserMessageAdded 回调
}

export const useChatSSE = (apiRoute: string, options: ChatOptions = {}) => {
  const { method = "POST", headers = {}, bodyBuilder } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");

  const controllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);
  // 使用 useEffect 在渲染完成后同步最新的 messages 到 ref
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const mergeStreamMessage = useCallback((content: string) => {
    if (!content) return;
    setMessages((prev) => {
      const lastIndex = prev.length - 1;
      const last = prev[lastIndex];
      // 只有当最后一条确实是 assistant 时才追加
      if (last && last.role === "assistant") {
        const newMessages = [...prev];
        newMessages[lastIndex] = {
          ...last,
          content: (last?.content || "") + content,
        };
        return newMessages;
      }
      return prev;
    });
  }, []);

  const stop = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setStatus("idle");
    }
  }, []);

  // 🟢 优化 2: sendMessage 现在返回 Promise<string> (消息ID)，并且不等待流结束
  const sendMessage = useCallback(
    async (userMessage: string): Promise<string> => {
      if (status === "streaming" || status === "sending") return "";

      if (controllerRef.current) controllerRef.current.abort();

      // 1. 准备 ID
      const userMsgId = Date.now().toString();
      const assistantMsgId = userMsgId + "_assistant";

      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        content: userMessage,
      };

      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
      };

      // 🟢 优化 3: 合并状态更新，减少渲染次数
      // 同时添加 "用户消息" 和 "AI占位符"
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      const controller = new AbortController();
      controllerRef.current = controller;
      setStatus("sending");

      const history = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body =
        method === "POST"
          ? JSON.stringify(
              bodyBuilder
                ? bodyBuilder({ currentMessage: userMessage, history })
                : { currentMessage: userMessage, history }
            )
          : undefined;

      // 🟢 优化 4: 异步执行请求，不阻塞函数返回
      // 这样 UI 可以立即拿到 ID 去做滚动处理
      fetchEventSource(apiRoute, {
        method,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body,
        // 强制在后台保持连接，防止切换标签页时连接中断导致回到前台后重新发起请求
        openWhenHidden: true,
        async onopen(res) {
          if (
            res.ok &&
            res.headers.get("content-type")?.includes(EventStreamContentType)
          ) {
            setStatus("streaming");
            return;
          }
          if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            throw new FatalError(`HTTP ${res.status}`);
          }
          throw new RetriableError(`HTTP ${res.status}`);
        },
        onmessage(event) {
          if (!event?.data || event.data === "[DONE]") {
            stop();
            return;
          }
          mergeStreamMessage(event.data);
        },
        onerror(err) {
          setStatus("error");
          throw new FatalError(err?.message || "未知 SSE 错误");
        },
      })
        .catch((err) => {
          if ((err as Error).name === "AbortError") {
            setStatus("idle");
          } else {
            console.error("SSE error:", err);
            setStatus("error");
          }
        })
        .finally(() => {
          if (controllerRef.current === controller) {
            controllerRef.current = null;
          }
        });

      // 立即返回 ID
      return userMsgId;
    },
    [apiRoute, method, headers, bodyBuilder, status, mergeStreamMessage, stop]
  );

  return { messages, status, sendMessage, setMessages, stop };
};
