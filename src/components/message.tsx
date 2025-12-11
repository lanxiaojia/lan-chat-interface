"use client";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Sparkles,
  User,
} from "lucide-react";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatMessageProps } from "../types";
import StreamingMarkdown, { StaticMarkdown } from "./markdown";

const COLLAPSE_HEIGHT = 300;

const ChatMessage = memo(
  ({
    message,
    isLoading,
    isLast,
    containerHeight = 0,
    onUpdate,
  }: ChatMessageProps) => {
    const isUser = message.role === "user";
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    const contentRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    // 状态保持
    const [hasActiveHeight, setHasActiveHeight] = useState(isLoading);

    if (isLoading && !hasActiveHeight) {
      setHasActiveHeight(true);
    }

    const shouldApplyMinHeight =
      !isUser && isLast && (isLoading || hasActiveHeight);

    useLayoutEffect(() => {
      const currentEl = document.getElementById(`msg-${message.id}`);
      if (!currentEl) return;

      // 1. 如果不需要撑开高度，或父容器高度未知，重置为 auto
      if (!shouldApplyMinHeight || !containerHeight) {
        currentEl.style.minHeight = "auto";
        return;
      }

      const prevEl = currentEl.previousElementSibling as HTMLElement;

      // 2. 将计算逻辑提取为函数
      const updateHeight = () => {
        const containerPadding = 24;
        const selfMarginBottom = 24;
        let occupiedSpace = 0;

        if (prevEl) {
          const style = window.getComputedStyle(prevEl);
          const marginTop = parseFloat(style.marginTop) || 0;
          const marginBottom = parseFloat(style.marginBottom) || 0;

          // 获取最新的用户消息高度（无论是折叠还是展开状态）
          occupiedSpace = prevEl.offsetHeight + marginTop + marginBottom;
        }

        let calculated =
          containerHeight - containerPadding - occupiedSpace - selfMarginBottom;
        if (calculated < 0) calculated = 0;

        currentEl.style.minHeight = `${calculated}px`;
      };

      // 3. 立即执行一次计算
      updateHeight();

      // 4. 使用 ResizeObserver 监听上一个元素的高度变化
      // 这样当用户消息触发折叠(setIsOverflowing)或手动展开时，这里会自动重新计算
      let resizeObserver: ResizeObserver | null = null;
      if (prevEl) {
        resizeObserver = new ResizeObserver(() => {
          updateHeight();
        });
        resizeObserver.observe(prevEl);
      }

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }, [shouldApplyMinHeight, containerHeight, message.id]);

    useEffect(() => {
      if (!isUser) return;
      const checkHeight = () => {
        if (contentRef.current) {
          setIsOverflowing(contentRef.current.scrollHeight > COLLAPSE_HEIGHT);
        }
      };
      checkHeight();
    }, [message.content, isExpanded, isUser]);

    const handleCopy = () => {
      copyToClipboard(message.content);
    };

    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
      if (onUpdate) setTimeout(onUpdate, 100);
    };

    const shouldCollapse = isUser && !isExpanded && isOverflowing;

    return (
      <article
        id={`msg-${message.id}`}
        // 样式完全由 useLayoutEffect 控制
        className={`lan-group lan-flex lan-w-full lan-gap-4 lan-mb-6 lan-scroll-mt-4 
          ${isUser ? "lan-flex-row-reverse" : "lan-flex-row"} 
          ${
            shouldApplyMinHeight
              ? "lan-transition-[min-height] lan-duration-300"
              : ""
          } 
        `}
        aria-label={isUser ? "User message" : "AI response"}
      >
        {/* 头像区域 */}
        <div className="lan-flex-shrink-0 lan-mt-1">
          {isUser ? (
            <div className="lan-w-8 lan-h-8 lan-rounded-full lan-bg-gray-200 lan-flex lan-items-center lan-justify-center lan-text-gray-600">
              <User size={18} />
            </div>
          ) : (
            <div
              className={`lan-w-8 lan-h-8 lan-rounded-full lan-flex lan-items-center lan-justify-center 
              ${isLoading ? "lan-text-blue-500" : "lan-text-blue-600"}
            `}
            >
              {isLoading ? (
                <span className="lan-relative lan-flex lan-h-5 lan-w-5">
                  <span className="lan-animate-ping lan-absolute lan-inline-flex lan-h-full lan-w-full lan-rounded-full lan-bg-blue-400 lan-opacity-75"></span>
                  <span className="lan-relative lan-inline-flex lan-rounded-full lan-h-5 lan-w-5 lan-bg-blue-500"></span>
                </span>
              ) : (
                <Sparkles size={22} className="lan-fill-blue-100" />
              )}
            </div>
          )}
        </div>

        {/* 消息内容区域 */}
        <div
          className={`lan-flex lan-flex-col lan-max-w-[85%] lan-sm:lan-max-w-[80%] ${
            isUser ? "lan-items-end" : "lan-items-start"
          }`}
        >
          {/* 用户名 */}
          <div className="lan-mb-1 lan-text-xs lan-text-gray-400 lan-px-1">
            {isUser ? "You" : "AI Assistant"}
          </div>

          {/* 气泡主体 */}
          <div
            className={`lan-prose-container lan-relative lan-px-5 lan-py-3.5 lan-text-[15px] lan-leading-7 lan-transition-all lan-duration-300
                ${
                  isUser
                    ? "lan-bg-[#e7f0fe] lan-text-gray-900 lan-rounded-[20px] lan-rounded-tr-sm"
                    : "lan-bg-transparent lan-text-gray-800 lan--ml-2 lan-px-2"
                }`}
          >
            <div
              ref={contentRef}
              className={`lan-relative lan-overflow-hidden ${
                shouldCollapse ? "lan-max-h-[300px]" : ""
              }`}
            >
              {isUser ? (
                <StaticMarkdown content={message.content} />
              ) : (
                <StreamingMarkdown
                  content={message.content}
                  speed={isLoading ? 5 : 0}
                  onUpdate={onUpdate}
                />
              )}

              {shouldCollapse && (
                <div className="lan-absolute lan-bottom-0 lan-left-0 lan-w-full lan-h-24 lan-pointer-events-none lan-rounded-b-[20px] lan-bg-gradient-to-t lan-from-[#e7f0fe] lan-via-[#e7f0fe]/90 lan-to-transparent" />
              )}
            </div>

            {isUser && isOverflowing && (
              <div className="lan-mt-3 lan-flex lan-justify-center lan-w-full">
                <button
                  onClick={toggleExpand}
                  className="lan-flex lan-items-center lan-justify-center lan-p-2 lan-bg-blue-100 lan-text-blue-600 lan-hover:lan-bg-blue-200 lan-hover:lan-text-blue-700 lan-rounded-full lan-transition-all lan-duration-200 lan-shadow-sm lan-group-hover/btn:lan-scale-110"
                  aria-label={isExpanded ? "收起" : "展开"}
                >
                  {isExpanded ? (
                    <ChevronUp size={20} strokeWidth={2.5} />
                  ) : (
                    <ChevronDown size={20} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            )}
          </div>

          {isUser && (
            <div className="lan-flex lan-items-center lan-gap-2 lan-mt-1 lan-mr-1 lan-opacity-0 lan-group-hover:lan-opacity-100 lan-transition-opacity lan-duration-200">
              <button
                onClick={handleCopy}
                className="lan-p-1.5 lan-text-gray-300 lan-hover:lan-text-gray-500 lan-rounded-md lan-transition-colors"
                title="Copy text"
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </article>
    );
  },
  (prev, next) => {
    return (
      prev.message.id === next.message.id &&
      prev.message.content === next.message.content &&
      prev.isLoading === next.isLoading &&
      prev.isLast === next.isLast &&
      prev.containerHeight === next.containerHeight
    );
  }
);

export default ChatMessage;
