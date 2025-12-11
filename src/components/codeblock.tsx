"use client";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Check, Copy } from "lucide-react";
import { FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CodeBlockProps } from "../types";

const CodeBlock: FC<CodeBlockProps> = memo(({ language, value }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(value);
  };

  return (
    <div className="lan-relative lan-w-full lan-font-sans codeblock lan-bg-[#1e1e1e] lan-rounded-lg lan-my-4 lan-overflow-hidden lan-border lan-border-gray-800">
      {/* 顶部栏 */}
      <div className="lan-flex lan-items-center lan-justify-between lan-w-full lan-px-4 lan-py-2 lan-bg-[#2d2d2d] lan-text-gray-200">
        <span className="lan-text-xs lan-lowercase lan-text-gray-400 lan-font-mono">
          {language || "code"}
        </span>
        <div className="lan-flex lan-items-center">
          <button
            onClick={onCopy}
            className="lan-flex lan-items-center lan-gap-1.5 lan-text-xs lan-text-gray-400 lan-hover:lan-text-white lan-transition-colors"
            aria-label="Copy code"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* 🟢 2. 滚动容器：显式控制滚动，确保宽度不超过父级 */}
      <div className="lan-w-full lan-overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          PreTag="div"
          showLineNumbers
          customStyle={{
            margin: 0,
            background: "transparent",
            padding: "1rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono), monospace", // 确保等宽字体
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
