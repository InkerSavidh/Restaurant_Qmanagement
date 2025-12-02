import React, { useState } from 'react';

// --- Components ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      <input
        className={`w-full px-4 py-3 rounded-md border border-gray-200 bg-brand-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all duration-200 placeholder-gray-400 text-sm ${className}`}
        {...props}
      />
    </div>
  );
};

interface AlertProps {
  message: string;
  type: 'success' | 'error';
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-brand-green' : 'bg-red-600';
  
  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded text-sm font-medium text-center shadow-sm mb-6`}>
      {message}
    </div>
  );
};

// --- Login Page Component ---

const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Login attempt with Username: ${username}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f7fb] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-[#5D3FD3] mb-6">
          RestroFlow Login
        </h1>

        {/* Success Alert */}
        <Alert 
          type="success" 
          message="You have been successfully logged out." 
        />

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <Input 
            label="Username" 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
          
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;