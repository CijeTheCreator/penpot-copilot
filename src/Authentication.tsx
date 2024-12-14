/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { htmlToPenpot } from "./lib/html-to-penpot2";
import { fetchWebpageServer, fillBucketServer } from "./lib/server";
import { useSearchParams } from "react-router-dom";

function TestHTML() {
  const [searchParams] = useSearchParams();
  const bucketId = searchParams.get("bucketId");
  useEffect(() => {
    async function fillBucket() {
      try {
        const canvas = document.querySelector("#ceejay") as HTMLElement;
        if (!canvas) throw new Error("No Ceejay");
        if (!bucketId) throw new Error("Missing bucketId");
        const { html, css } = await fetchWebpageServer(bucketId);
        if (!html || !css) throw new Error("Missing html or css");
        canvas.innerHTML = html;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
        const penpotTree = htmlToPenpot(canvas);
        if (penpotTree.length > 0 && penpotTree[0].type == "FRAME") {
          penpotTree.shift();
        }
        const fillBucketResult = await fillBucketServer(
          bucketId,
          JSON.stringify(penpotTree),
        );
        if (!fillBucketResult.success) throw new Error("Bucket fill failed");
        window.close();
      } catch (error) {
        const catchError = error as Error;
        console.error(catchError.message);
      }
    }
    fillBucket();
  });
  return (
    <div className="w-[1920px] h-[1080px]">
      <div id="ceejay" className="bg-pink-50 p-8 rounded h-full"></div>
    </div>
  );
}

export default TestHTML;
