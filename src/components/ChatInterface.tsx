"use client";

import { useChatSSE } from "@/hooks/useChatSSE";
import { ArrowDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatInterfaceProps } from "../types";
import MessageInput from "./input";
import ChatMessage from "./message";

/* --------------------------------------------------------
 * 🟢 新增：自定义平滑滚动逻辑 (解决原生滚动生硬问题)
 * -------------------------------------------------------- */

// 1. 缓动函数 (Ease Out Cubic) - 产生"如丝般顺滑"的刹车感
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

// 2. 核心滚动函数
function smoothScrollToElement(
  container: HTMLElement,
  element: HTMLElement,
  duration: number = 600, // 默认 600ms，比原生的稍微慢一点点，更有质感
  offset: number = 0 // 额外的顶部偏移量 (比如留出一点空隙)
) {
  const containerTop = container.getBoundingClientRect().top;
  const elementTop = element.getBoundingClientRect().top;

  // 计算目标位置：当前 scrollTop + (元素距离容器顶部的相对距离) - 偏移量
  const startPosition = container.scrollTop;
  const targetPosition = startPosition + (elementTop - containerTop) - offset;
  const distance = targetPosition - startPosition;

  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;

    // 计算当前进度 (0 ~ 1)
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeOutCubic(progress);

    container.scrollTop = startPosition + distance * ease;

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/* --------------------------------------------------------
 * 辅助函数：自动滚到底（AI 回复时）
 * -------------------------------------------------------- */
function scrollToBottom(container: HTMLElement) {
  // AI 回复时的自动滚动通常不需要太花哨的动画，直接设置即可，
  // 或者使用简单的 behavior: 'smooth'，因为它距离通常很短。
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

export default function ChatInterface({
  apiRoute,
  method = "GET",
  initialMessage = "你好，我是 AI 助手，有什么可以帮你？",
  title,
  className = "",
  initialHistory = [],
  bodyBuilder,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // 控制是否自动跟随到底部
  const [autoScroll, setAutoScroll] = useState(true);

  const autoScrollRef = useRef(autoScroll);
  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  // 用于存储滚动容器的精准可视高度
  const [containerHeight, setContainerHeight] = useState(0);

  const { messages, status, sendMessage, setMessages, stop } = useChatSSE(
    apiRoute,
    {
      method,
      bodyBuilder,
    }
  );

  const isTyping = status === "sending" || status === "streaming";

  useEffect(() => {
    // 只有当明确传入了历史记录，且当前列表为空时才加载
    if (initialHistory.length > 0 && messages.length === 0) {
      setMessages(initialHistory);
    }
    // 注意：如果是新会话，messages 保持为空数组 []
  }, []);

  /* --------------------------------------------------------
   * 动态计算容器高度
   * -------------------------------------------------------- */
  useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /* --------------------------------------------------------
   * 监听用户滚动 (AutoScroll 开关)
   * -------------------------------------------------------- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      // 🟢 核心修复：如果是代码触发的滚动，忽略 scroll 事件，防止闪烁
      if (isProgrammaticScroll.current) return;

      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        40;

      if (nearBottom !== autoScroll) {
        setAutoScroll(nearBottom);
      }
    };

    container.style.scrollBehavior = "auto";
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [autoScroll]);

  /* --------------------------------------------------------
   * 响应消息更新 (执行滚动)
   * -------------------------------------------------------- */
  useEffect(() => {
    if (messages.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const last = messages[messages.length - 1];

    if (last.role === "assistant" && autoScroll) {
      setTimeout(() => {
        scrollToBottom(container);
      }, 10);
    }
  }, [messages, autoScroll]);

  /* --------------------------------------------------------
   * 发送消息处理
   * -------------------------------------------------------- */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const msgContent = inputValue.trim();
    setInputValue("");

    setAutoScroll(true);

    const newMsgId = await sendMessage(msgContent);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`msg-${newMsgId}`);
        const container = scrollContainerRef.current;

        if (el && container) {
          // 🟢 使用自定义的平滑滚动函数
          // duration: 800ms (更从容)
          // offset: 20px (顶部稍微留一点白，不那么压抑)
          smoothScrollToElement(container, el, 800, 20);
        }
      }, 50);
    });
  };

  // 辅助函数：手动点击回到底部
  const scrollToBottomSmooth = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 1. 上锁：告诉 onScroll 监听器“别管我，我在自动滚”
    isProgrammaticScroll.current = true;

    // 2. 立即更新状态（隐藏按钮）
    setAutoScroll(true);

    // 3. 执行滚动
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

    // 4. 延时解锁：等待滚动动画结束后（通常 500-800ms），恢复监听
    // 使用 setTimeout 是最简单的方案，1秒足以覆盖大多数平滑滚动时长
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  /* --------------------------------------------------------
   * UI
   * -------------------------------------------------------- */
  return (
    <div
      className={`lan-flex lan-flex-col lan-h-full lan-min-h-0 lan-w-full lan-bg-white lan-relative ${className}`}
    >
      {/* 标题栏 */}
      {title && (
        <div className="lan-flex-shrink-0 lan-h-14 lan-border-b lan-border-gray-200 lan-flex lan-items-center lan-px-6">
          <span className="lan-font-semibold lan-flex lan-items-center lan-gap-2">
            <Sparkles size={18} className="lan-text-blue-500" />
            {title}
          </span>
        </div>
      )}

      {/* 消息列表区域 */}
      <div
        ref={scrollContainerRef}
        // 🟢 修改点：添加 scrollbar-none 以及兼容各浏览器的隐藏样式
        className="lan-flex-1 lan-min-h-0 lan-overflow-y-auto lan-px-4 lan-pt-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        {messages.length === 0 ? (
          <div className="lan-h-full lan-flex lan-flex-col lan-items-center lan-justify-center lan-select-none lan-pb-20">
            <div className="lan-w-16 lan-h-16 lan-bg-blue-50 lan-rounded-2xl lan-flex lan-items-center lan-justify-center lan-mb-6 lan-shadow-sm">
              <Sparkles size={32} className="lan-text-blue-500" />
            </div>

            <p className="lan-text-gray-500 lan-text-sm lan-max-w-xs lan-text-center lan-leading-relaxed">
              {initialMessage}
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLoading={isTyping && index === messages.length - 1}
              isLast={index === messages.length - 1}
              containerHeight={containerHeight}
              isAutoScroll={autoScroll}
              onUpdate={() => {
                if (!autoScrollRef.current) return;
                const container = scrollContainerRef.current;
                if (!container) return;
                scrollToBottom(container);
              }}
            />
          ))
        )}
      </div>

      {/* 回到底部悬浮按钮 */}
      {!autoScroll && messages.length > 0 && (
        <button
          onClick={scrollToBottomSmooth}
          className="lan-absolute lan-bottom-24 lan-right-6 lan-w-10 lan-h-10 lan-bg-white lan-border lan-border-gray-200 lan-text-blue-600 lan-rounded-full lan-shadow-lg lan-flex lan-items-center lan-justify-center lan-hover:lan-bg-gray-50 lan-transition-all lan-animate-in lan-fade-in lan-zoom-in lan-duration-200 lan-z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* 输入框区域 */}
      <div className="lan-flex-shrink-0">
        <MessageInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={handleSendMessage}
          isTyping={isTyping}
          onStop={stop}
        />
      </div>
    </div>
  );
}
