"use client";

import { useState } from "react";

export interface useCopyToClipboardProps {
  timeout?: number;
}

export function useCopyToClipboard({
  timeout = 2000,
}: useCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !value) {
      return;
    }

    // 提取公共的成功回调
    const handleSuccess = () => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    };

    // 方案 B：回退方案 (兼容 HTTP 和旧浏览器)
    const fallbackCopy = (text: string) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // 确保 textarea 不在可视区域，避免页面闪烁
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        // 执行旧版复制命令
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          handleSuccess();
        } else {
          console.error("无法复制：浏览器不支持或被拦截");
        }
      } catch (err) {
        console.error("复制出错:", err);
      }
    };

    // 方案 A：优先使用现代标准 API (需要 HTTPS)
    if (navigator?.clipboard && navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(handleSuccess)
        .catch((err) => {
          // 如果标准 API 报错（可能是权限问题），尝试回退方案
          console.warn(
            "Standard clipboard API failed, trying fallback...",
            err
          );
          fallbackCopy(value);
        });
    } else {
      // 如果 navigator.clipboard 不存在（HTTP 环境），直接使用回退方案
      fallbackCopy(value);
    }
  };

  return { isCopied, copyToClipboard };
}
