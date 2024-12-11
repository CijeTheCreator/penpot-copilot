/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import "./App.css";
import { htmlToPenpot } from "./lib/html-to-penpot2";

function Plugin() {
  const url = new URL(window.location.href);
  const initialTheme = url.searchParams.get("theme");
  const [theme] = useState(initialTheme || null);
  const [user, setUser] = useState<string | null>(null);

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
    const body = document.querySelector("body");
    if (!body) return console.log("Pulling out, there is no body");
    console.log(JSON.stringify(htmlToPenpot(body, true)));
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
