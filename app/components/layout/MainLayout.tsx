"use client";

import { FC, ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 min-w-0">
          <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
