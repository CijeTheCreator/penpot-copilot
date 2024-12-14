/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import "./App.css";
import {
  ogResponseServer,
  createHTMLServer,
  createBucketServer,
  TPollBucket,
  pollBucketServer,
  FE_ADDRESS,
  // getUserTrialsServer,
} from "./lib/server";
import { ChatInterface } from "./components/ChatInterface";
import { TMessage_CreateComponent } from "./plugin";

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
  try {
    const possibleHtml = await createHTMLServer(userId, prompt);
    if (!(possibleHtml.success && possibleHtml.html && possibleHtml.css))
      throw new Error(possibleHtml.error!);

    const html = possibleHtml.html;
    const css = possibleHtml.css;
    await createPenpotTree(html, css);
    return "success";
  } catch (error) {
    const catchError = error as Error;
    return catchError.message;
  }
}

async function createPenpotTree(html: string, css: string) {
  try {
    const fillBucketResponse = await createBucketServer(html, css);
    if (!fillBucketResponse.success || !fillBucketResponse.bucketId)
      throw new Error("Issue creating bucket");
    const bucketId = fillBucketResponse.bucketId;
    const newTab = window.open(
      `${FE_ADDRESS}/test?bucketId=${bucketId}`,
      "_blank",
    );
    if (!newTab)
      throw new Error(
        "Failed to open new tab (likely blocked by a popup blocker).",
      );
    await poll(pollBucketServer, 1000, 20000, bucketId);
    const penpotTreeResponse = await pollBucketServer(bucketId);
    if (!penpotTreeResponse.penpotTree)
      throw new Error("Failed to create tree");
    const penpotTree = JSON.parse(penpotTreeResponse.penpotTree);
    const penpotCreateMessage: TMessage_CreateComponent = {
      message: "create_component",
      componentTree: penpotTree,
    };
    parent.postMessage(penpotCreateMessage, "*");
  } catch (error) {
    const catchError = error as Error;
    throw new Error(catchError.message);
  }
}
// function createPenpotTree() {
//   const innerHTML = workingHtml;
//   const { tempContainer, newElement } = createElementInDOM(innerHTML);
//   const penpotTree = htmlToPenpot(newElement);
//   const penpotCreateMessage: TMessage_CreateComponent = {
//     message: "create_component",
//     componentTree: mockTree,
//   };
//   parent.postMessage(penpotCreateMessage, "*");
//   console.log(JSON.stringify(penpotTree));
//   // document.body.removeChild(tempContainer);
// }
// function createPenpotTree(innerHTML: string) {
//   const newElement = document.querySelector("body");
//   if (!newElement) return console.log("Failed to get new element");
//   const penpotTree = htmlToPenpot(newElement);
//   const penpotCreateMessage: TMessage_CreateComponent = {
//     message: "create_component",
//     componentTree: penpotTree,
//   };
//   parent.postMessage(penpotCreateMessage, "*");
//   console.log(JSON.stringify(penpotTree));
// }
// FIXME: Mock Implementation above
// function createPenpotTree(innerHTML: string) {
//   const { tempContainer, newElement } = createElementInDOM(innerHTML);
//   const penpotTree = htmlToPenpot(newElement);
//   const penpotCreateMessage: TMessage_CreateComponent = {
//     message: "create_component",
//     componentTree: penpotTree,
//   };
//   parent.postMessage(penpotCreateMessage, "*");
//   console.log(JSON.stringify(penpotTree));
//   document.body.removeChild(tempContainer);
// }

// function createElementInDOM(innerHTML: string) {
//   const tempContainer = document.createElement("div");
//   tempContainer.style.position = "absolute";
//   tempContainer.style.visibility = "hidden";
//   document.body.appendChild(tempContainer);
//   const newElement = document.createElement("div");
//   newElement.innerHTML = innerHTML;
//   tempContainer.appendChild(newElement);
//   return { tempContainer, newElement };
// }
function PluginComponent() {
  const url = new URL(window.location.href);
  const initialTheme = url.searchParams.get("theme");
  const [theme] = useState(initialTheme || null);
  const [user, setUser] = useState<string | null>(null);

  const [reply, setReply] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [blank, setBlank] = useState<boolean>(true);
  const [replyLoadingText, setReplyLoadingText] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  function resetReply() {
    setReply(null);
    setReplyLoadingText(null);
    setReplyLoading(false);
    setReplyError(null);
    setBlank(true);
  }

  parent.postMessage(
    {
      message: "id_request",
    },
    "*",
  );

  async function handleSubmit(prompt: string) {
    resetReply();
    setBlank(false);
    setReplyLoading(true);
    if (!user) {
      setReplyLoading(false);
      setReplyError("User details not available yet");
      return;
    }
    const intent = await handleInitialPrompt(prompt, user);
    // const intent = "create";
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
        // setReplyLoading(false);
        setReplyLoadingText("Creating component");

        const createState = await handleCreate(prompt, user);
        if (createState == "success") {
          setReplyLoading(false);
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
    <div data-theme={theme} className="p-4 dark w-full h-full">
      <ChatInterface
        reply={reply}
        replyLoading={replyLoading}
        replyLoadingText={replyLoadingText}
        replyError={replyError}
        handleSubmit={function (prompt): void {
          handleSubmit(prompt);
        }}
        handleReset={function (): void {
          resetReply();
        }}
        blank={blank}
      />
    </div>
  );
}

export default PluginComponent;

async function poll(
  checkFunction: (bucketId: string) => Promise<TPollBucket>,
  interval: number,
  timeout: number,
  bucketId: string,
) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      const resultResponse = await checkFunction(bucketId);
      const result = resultResponse.pollResult;

      if (result) {
        clearInterval(timer);
        resolve(result);
      } else if (Date.now() - startTime >= timeout) {
        clearInterval(timer);
        reject(new Error("Polling timed out."));
      }
    }, interval);
  });
}
