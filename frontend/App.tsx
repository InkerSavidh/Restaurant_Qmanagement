import React, { useState, useEffect } from 'react';
import Login from './Pages/Login/Login';
import Sidebar from './Components/Sidebar';
import Dashboard from './Pages/Dashboard/Dashboard';
import TableStatus from './Pages/TableStatus/TableStatus';
import OccupiedTables from './Pages/OccupiedTables/OccupiedTables';
import QueueManagement from './Pages/QueueManagement/QueueManagement';
import ActivityLog from './Pages/ActivityLog/ActivityLog';
import ManageWaiters from './Pages/ManageWaiters/ManageWaiters';
import CustomerHistory from './Pages/CustomerHistory/CustomerHistory';
import { loginApi, logoutApi } from './api/auth.api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed on mobile

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024); // Collapse on mobile/tablet
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsLoggedIn(true);
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = () => {
    logoutApi();
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    sessionStorage.setItem('loggedOut', 'true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-4">
        {/* App-level skeleton */}
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-64 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-64 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }


  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#5D3FD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span className="text-lg font-bold text-[#5D3FD3]">RestroFlow</span>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <Sidebar 
        activePage={currentPage} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 lg:ml-20 lg:${isSidebarCollapsed ? 'ml-20' : 'ml-64'} overflow-auto transition-all duration-300 pt-16 lg:pt-0`}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'table-status' && <TableStatus />}
        {currentPage === 'occupied-tables' && <OccupiedTables />}
        {currentPage === 'queue-management' && <QueueManagement />}
        {currentPage === 'activity-log' && <ActivityLog />}
        {currentPage === 'manage-waiters' && <ManageWaiters />}
        {currentPage === 'customer-history' && <CustomerHistory />}
      </main>
    </div>
  );
};

export default App;
