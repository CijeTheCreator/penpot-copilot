/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
// import "./App.css";
import { htmlToPenpot } from "./lib/html-to-penpot2";
import { fillBucketServer } from "./lib/server";

function TestHTML() {
  //TODO: Get these from the search params
  //Make sure css is not reaching here
  const html = "";
  const css = "";
  const bucketId = "";
  useEffect(() => {
    async function fillBucket() {
      try {
        const canvas = document.querySelector("#ceejay") as HTMLElement;
        if (!canvas) throw new Error("No Ceejay");
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
      <div id="ceejay" className="bg-pink-50 p-8 rounded"></div>
    </div>
  );
}

export default TestHTML;
