import { useState } from "react";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-[100vw] min-h-[100vh] mx-auto font-clash bg-zinc-900">
      <Toaster />
      <Navbar />
      <div className="w-[70vw] mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
