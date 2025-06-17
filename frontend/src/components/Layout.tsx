import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <ChartBarIcon className="w-6 h-6" />,
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: <BanknotesIcon className="w-6 h-6" />,
    },
    {
      name: 'Budgets',
      path: '/budgets',
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      name: 'Goals',
      path: '/goals',
      icon: <CheckCircleIcon className="w-6 h-6" />,
    },
    {
      name: 'Investments',
      path: '/investments',
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <UserCircleIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-secondary-200 shadow-lg transition duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-primary-600">FinPace</h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-secondary-700 rounded-md hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex flex-col h-full p-4 space-y-1">
          <div className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-base rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-secondary-700 hover:bg-secondary-100'
                  }`
                }
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-secondary-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-base text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3" />
              Log Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-secondary-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-secondary-700 rounded-md lg:hidden hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary-800">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;