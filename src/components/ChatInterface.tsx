import { useEffect, useRef, useState } from "react";
import { useEnterSubmit } from "./UseEnterSubmit";
import { Question } from "./Question";
import { AILoading, AIResponse } from "./AIResponse";
import { EmptyScreen } from "./EmptyScreen";
import { ChatScrollAnchor } from "./ChatScrollAnchor";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Textarea from "react-textarea-autosize";
import { IconPaperPlane } from "./Icons";

export function ChatInterface({
  reply,
  replyLoading,
  replyLoadingText,
  replyError,
  blank,
  handleSubmit,
  handleReset,
}: {
  reply: string | null;
  replyLoading: boolean;
  replyLoadingText: string | null;
  replyError: string | null;
  blank: boolean;
  handleSubmit: (prompt: string) => void;
  handleReset: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [question, setQuestion] = useState("");
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (
          e.target &&
          ["INPUT", "TEXTAREA"].includes((e.target as any).nodeName)
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (inputRef?.current) {
          inputRef.current.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputRef]);

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-col flex-1">
          <div className="pb-[200px] pt-4 md:pt-10">
            {!blank ? (
              <div className="relative mx-auto max-w-3xl px-4">
                <Question question={question} />
                {replyLoading ? (
                  <AILoading replyLoadingText={replyLoadingText} />
                ) : (
                  <AIResponse answer={reply} error={replyError} />
                )}
              </div>
            ) : (
              <EmptyScreen />
            )}
            <ChatScrollAnchor trackVisibility={true} />
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 w-full peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] z-50">
        <div className="mx-auto sm:max-w-3xl sm:px-4 mb-12">
          <form
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const messageInput = form["message"] as HTMLInputElement;
              messageInput.blur();
              const value = inputValue.trim();
              setInputValue("");
              if (!value) return;

              setQuestion(value);
              handleSubmit(value);
            }}
          >
            {blank ? (
              <div className="relative flex flex-col w-full px-4 overflow-hidden max-h-60 grow    sm:rounded-md sm:border sm:px-16">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 w-8 h-8 p-0 rounded-full top-4  sm:left-4"
                      onClick={() => handleReset()}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
                <Textarea
                  ref={inputRef}
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                  placeholder="Send a message."
                  className="min-h-[60px] w-full resize-none bg-transparent py-[1.3rem] focus-within:outline-none sm:text-sm "
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  name="message"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <div className="absolute right-0 top-4 sm:right-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={inputValue === ""}
                        variant={"outline"}
                      >
                        <IconPaperPlane />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="flex flex-row w-full items-center justify-center">
                <Button>New Request</Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
