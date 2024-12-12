/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import "./App.css";
import { htmlToPenpot } from "./lib/html-to-penpot2";
import {
  ogResponseServer,
  createHTMLServer,
  // getUserTrialsServer,
} from "./lib/server";
import { ChatInterface } from "./components/ChatInterface";
// import { testHtml } from "./testInnerHtml";

type TPossibleOGOutcomes =
  | "create"
  | "edit"
  | "delete"
  | "rag"
  | "undefined"
  | "multiple"
  | "error";
async function handleInitialPrompt(
  prompt: string,
  userId: string,
): Promise<TPossibleOGOutcomes> {
  const possibleIntentOutcome = await ogResponseServer(userId, prompt);
  if (possibleIntentOutcome.success && possibleIntentOutcome.og_response) {
    const intent = possibleIntentOutcome.og_response as TPossibleOGOutcomes;
    return intent;
  } else {
    return "error";
  }
}
async function handleCreate(prompt: string, userId: string) {
  const possibleHtml = await createHTMLServer(userId, prompt);
  if (possibleHtml.success && possibleHtml.html) {
    const html = possibleHtml.html;
    createPenpotTree(html);
    return "success";
  } else {
    return possibleHtml.error!;
  }
}

//TODO: Coming soon for all these
// async function handleMultiple(prompt: string, userId: string) {}
// async function handleUndefined(prompt: string, userId: string) {}
// async function handleEdit(prompt: string, userId: string) {}

//TODO: Make this logic last
// async function handleDelete(prompt: string, userId: string) {}

function createPenpotTree(innerHTML: string) {
  const { tempContainer, newElement } = createElementInDOM(innerHTML);
  const penpotTree = htmlToPenpot(newElement);
  console.log(JSON.stringify(penpotTree));
  document.body.removeChild(tempContainer);
}

function createElementInDOM(innerHTML: string) {
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.visibility = "hidden";
  document.body.appendChild(tempContainer);
  const newElement = document.createElement("div");
  newElement.innerHTML = innerHTML;
  tempContainer.appendChild(newElement);
  return { tempContainer, newElement };
}
function Plugin() {
  const url = new URL(window.location.href);
  const initialTheme = url.searchParams.get("theme");
  const [theme] = useState(initialTheme || null);
  const [user, setUser] = useState<string | null>(null);

  const [reply, setReply] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [replyLoadingText, setReplyLoadingText] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  function resetReply() {
    setReply(null);
    setReplyLoadingText(null);
    setReplyLoading(false);
    setReplyError(null);
  }

  parent.postMessage(
    {
      message: "id_request",
    },
    "*",
  );

  async function handleSubmit(prompt: string) {
    resetReply();
    setReplyLoading(true);
    if (!user) {
      setReplyLoading(false);
      setReplyError("User details not available yet");
      return;
    }
    const intent = await handleInitialPrompt(prompt, user);
    switch (intent) {
      case "undefined": {
        setReplyLoading(false);
        setReplyLoadingText(null);
        setReply(
          "I did not get that, please ask a question related to penpot, or describe a design you want created",
        );
        return;
      }
      case "create": {
        setReplyLoading(false);
        setReplyLoadingText("Creating component");

        const createState = await handleCreate(prompt, user);
        if (createState == "success") {
          return setReply("Your component has been created, hope you like it");
        } else {
          return setReplyError(`Error creating component: ${createState}`);
        }
      }
      case "edit": {
        setReplyLoading(false);
        setReplyLoadingText(null);
        setReply("The Editing feature is coming soon");
        return;
      }
      case "delete": {
        setReplyLoading(false);
        setReplyLoadingText(null);
        setReply("The Deleting feature is coming soon");
        return;
      }
      case "rag": {
        setReplyLoading(false);
        setReplyLoadingText(null);
        setReply("This feature is coming soon");
        return;
      }
      case "multiple": {
        setReplyLoading(false);
        setReplyLoadingText(null);
        setReply("You can only specify one command at a time");
        return;
      }
      case "error": {
        setReplyLoading(false);
        setReplyLoadingText(null);
        setReplyError(
          "I did not get that, please ask a question related to penpot, or describe a design you want created",
        );
        return;
      }
    }
  }

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.type == "user_id_response") {
      const userId = message.userId;
      setUser(userId);
    }
  });

  useEffect(() => {
    // createPenpotTree(testHtml);
  }, []);

  return (
    <div
      data-theme={theme}
      className="flex flex-col gap-4 items-center p-4 dark w-full h-full"
    >
      <ChatInterface
        reply={reply}
        replyLoading={replyLoading}
        replyLoadingText={replyLoadingText}
        replyError={replyError}
        handleSubmit={function (): void {
          handleSubmit("");
        }}
      />
    </div>
  );
}

export default Plugin;
