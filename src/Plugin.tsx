/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import "./App.css";
import { htmlToPenpot } from "./lib/html-to-penpot2";
// import { testHtml } from "./testInnerHtml";

function Plugin() {
  const url = new URL(window.location.href);
  const initialTheme = url.searchParams.get("theme");
  const [theme] = useState(initialTheme || null);
  const [, setUser] = useState<string | null>(null);

  parent.postMessage(
    {
      message: "id_request",
    },
    "*",
  );

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
      <div>Plugin</div>
    </div>
  );
}

export default Plugin;
async function handleInitialPrompt(
  prompt: string,
  userId: string,
  openAIKey: string,
): Promise<
  "create" | "edit" | "delete" | "rag" | "undefined" | "multiple" | "error"
> {
  return "undefined";
}
function handleCreate(prompt: string, userId: string, openAIKey: string) {}
function handleMultiple(prompt: string, userId: string, openAIKey: string) {}
function handleUndefined(prompt: string, userId: string, openAIKey: string) {}
function handleEdit(prompt: string, userId: string, openAIKey: string) {}
function handleDelete(prompt: string, userId: string, openAIKey: string) {}

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
