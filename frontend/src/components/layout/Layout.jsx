import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path === '/') return 'MRO Fleet Operations Dashboard';
    if (path.startsWith('/aircraft')) return 'Aircraft Fleet Registry & 3D Inspection';
    if (path.startsWith('/maintenance')) return 'Scheduled & Line Maintenance Management';
    if (path.startsWith('/work-orders')) return 'MRO Engineering Work Orders';
    if (path.startsWith('/technicians')) return 'Certified Technicians & Roster';
    if (path.startsWith('/spare-parts')) return 'Spare Parts Inventory & Warehousing';
    if (path.startsWith('/reports')) return 'Fleet Health & Maintenance Analytics';
    if (path.startsWith('/settings')) return 'MRO System Configuration';
    return 'FlightFix Aviation System';
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
