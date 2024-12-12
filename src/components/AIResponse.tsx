import remarkGfm from "remark-gfm";
import PulseLoader from "react-spinners/ClipLoader";
import remarkMath from "remark-math";
import { MemoizedReactMarkdown } from "./MemoizedReactMarkdown";
import { PRIMARY_COLOR_HEX } from "@/processing";

export function AIResponse({
  answer,
  error,
}: {
  answer: string | null;
  error: string | null;
}) {
  return (
    <MemoizedReactMarkdown
      className={
        "prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 mb-3 space-y-2 pt-4" +
        `${error ? "text-destructive" : ""}`
      }
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        h2({ children }) {
          return <h2 className="text-lg font-semibold">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-md font-semibold">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-5">{children}</ul>;
        },
        li({ children }) {
          return <li className="mb-2 last:mb-0">{children}</li>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5">{children}</ol>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="pl-4 border-l-4 border-primary-foreground">
              {children}
            </blockquote>
          );
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },

        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
      }}
    >
      {error ? error : answer}
    </MemoizedReactMarkdown>
  );
}
export function AILoading({
  replyLoadingText,
}: {
  replyLoadingText: string | null;
}) {
  return (
    <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 mb-3 space-y-2 pt-4">
      <div className="flex flex-row gap-2">
        <PulseLoader color={PRIMARY_COLOR_HEX} />
        {replyLoadingText ? replyLoadingText : ""}
      </div>
    </div>
  );
}
