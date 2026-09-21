import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-command-950 text-slate-100 font-sans antialiased selection:bg-sky-500/25 selection:text-sky-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#070a0f] p-3 sm:p-5 relative bg-topo-pattern">
          <div className="max-w-[1720px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
