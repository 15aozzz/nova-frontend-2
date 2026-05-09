import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}