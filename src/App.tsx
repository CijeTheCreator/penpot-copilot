/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import "./App.css";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PluginComponent from "./PluginComponent";
import TestHTML from "./Authentication";

function App() {
  const url = new URL(window.location.href);
  const initialTheme = url.searchParams.get("theme");
  const [theme] = useState(initialTheme || null);
  return (
    <div data-theme={theme} className="flex flex-col gap-4 items-center dark">
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PluginComponent />}></Route>
          <Route path="/test" element={<TestHTML />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
