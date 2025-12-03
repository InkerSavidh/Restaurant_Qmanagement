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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D3FD3]"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }


  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <Sidebar 
        activePage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} overflow-auto transition-all duration-300`}>
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
