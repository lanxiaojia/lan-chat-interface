"use client";

import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
// 🟢 1. 引入插件
import remarkBreaks from "remark-breaks";
import { CodeBlock } from "./codeblock";

import "katex/dist/katex.min.css";
import { StreamingMarkdownProps } from "../types";

// 提取通用的 Markdown 组件配置
const markdownComponents = {
  pre: ({ children }: any) => <>{children}</>,
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    if (!inline && match) {
      return (
        <CodeBlock
          language={language}
          value={String(children).replace(/\n$/, "")}
          {...props}
        />
      );
    }
    if (!inline) {
      return (
        <CodeBlock
          language="text"
          value={String(children).replace(/\n$/, "")}
          {...props}
        />
      );
    }
    return (
      <code
        className={`${className} lan-bg-gray-200 lan-dark:lan-bg-gray-700 lan-px-1.5 lan-py-0.5 lan-rounded lan-text-sm lan-text-pink-500 lan-font-mono`}
        {...props}
      >
        {children}
      </code>
    );
  },
  a: ({ node, ...props }: any) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="lan-text-blue-600 lan-hover:lan-underline"
    />
  ),
};

// 🟢 2. 提取插件配置，确保两处都生效
const remarkPluginsList = [remarkGfm, remarkMath, remarkBreaks];
const rehypePluginsList = [rehypeKatex];

// 🟢 1. StreamingMarkdown: 用于 AI 打字机效果
const StreamingMarkdown = memo(
  ({
    content,
    speed = 0,
    className = "",
    onUpdate,
  }: StreamingMarkdownProps) => {
    const [displayedText, setDisplayedText] = useState(
      speed === 0 ? content : ""
    );
    const lastContentRef = useRef(speed === 0 ? content : "");

    useEffect(() => {
      if (speed <= 0) {
        setDisplayedText(content);
        lastContentRef.current = content;
        if (onUpdate) onUpdate();
        return;
      }

      if (document.hidden) {
        setDisplayedText(content);
        lastContentRef.current = content;
        if (onUpdate) onUpdate();
        return;
      }

      const old = lastContentRef.current;
      if (content.length < old.length) {
        setDisplayedText(content);
        lastContentRef.current = content;
        return;
      }

      const diff = content.slice(old.length);
      if (!diff) return;

      let i = 0;
      const interval = setInterval(() => {
        const nextChar = diff[i] || "";
        setDisplayedText((prev) => {
          const next = prev + nextChar;
          lastContentRef.current = next;
          if (onUpdate) onUpdate();
          return next;
        });
        i++;
        if (i >= diff.length) clearInterval(interval);
      }, speed);

      return () => clearInterval(interval);
    }, [content, speed, onUpdate]);

    return (
      <div
        className={`lan-prose lan-prose-slate lan-break-words lan-dark:lan-prose-invert lan-max-w-none ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={remarkPluginsList} // 🟢 使用公共配置
          rehypePlugins={rehypePluginsList} // 🟢 使用公共配置
          components={markdownComponents}
        >
          {displayedText}
        </ReactMarkdown>
      </div>
    );
  }
);

StreamingMarkdown.displayName = "StreamingMarkdown";

// 🟢 2. StaticMarkdown: 用于用户消息
export const StaticMarkdown = memo(
  ({ content, className = "" }: { content: string; className?: string }) => {
    return (
      <div
        className={`lan-prose lan-prose-slate lan-break-words lan-dark:lan-prose-invert lan-max-w-none ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={remarkPluginsList} // 🟢 使用公共配置
          rehypePlugins={rehypePluginsList} // 🟢 使用公共配置
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);
StaticMarkdown.displayName = "StaticMarkdown";

export default StreamingMarkdown;
