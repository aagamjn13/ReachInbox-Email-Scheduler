import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Clock, Send, Plus, ChevronDown, LogOut, Settings, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useScheduledEmails, useSentEmails } from '../../hooks/useEmails';
import { useSlack } from '../../hooks/useSlack';
import Avatar from '../ui/Avatar';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: scheduledData } = useScheduledEmails(1, 1);
  const { data: sentData } = useSentEmails(1, 1);
  const { status: slackStatus } = useSlack();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-[260px] flex-col border-r border-gray-200 bg-white">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 mt-2">
        <svg width="73" height="29" viewBox="0 0 73 29" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.8475 2.12646H5.2168V26.4746H18.8475V2.12646ZM14.9552 6.01877H9.10911V22.5823H14.9552V6.01877Z" fill="#0A0A0A"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M37.9152 2.12646H24.2845V26.4746H28.1768V10.2312L34.0229 18.0188V26.4746H37.9152V2.12646ZM34.0229 10.2312L28.1768 2.12646H34.0229V10.2312Z" fill="#0A0A0A"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M56.9829 2.12646H43.3522V26.4746H56.9829V2.12646ZM53.0906 6.01877H47.2445V12.1851H53.0906V6.01877ZM47.2445 16.4158H53.0906V22.5823H47.2445V16.4158Z" fill="#0A0A0A"/>
        </svg>
      </div>

      {/* User Card */}
      <div className="px-4 py-2">
        <div 
          className="relative flex cursor-pointer items-center gap-3 rounded bg-gray-50 p-2 border border-gray-100 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Avatar src={user?.avatarUrl} alt={user?.name} size="sm" fallback={user?.name || 'User'} />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Button */}
      <div className="px-4 py-2 mb-4 mt-2">
        <button
          onClick={() => navigate('/compose')}
          className="w-full rounded-full border border-green-600 py-1.5 text-green-600 transition-colors hover:bg-green-50"
        >
          <span className="font-medium text-sm">Compose</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2">
        <div className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          CORE
        </div>
        <nav className="space-y-1">
          <NavLink
            to="/scheduled"
            className={({ isActive }) =>
              `flex items-center justify-between rounded-full px-3 py-2 text-sm transition-colors ${
                isActive 
                  ? 'bg-green-50/50 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Scheduled</span>
            </div>
            <span className="text-xs text-gray-400">{scheduledData?.total || 0}</span>
          </NavLink>
          <NavLink
            to="/sent"
            className={({ isActive }) =>
              `flex items-center justify-between rounded-full px-3 py-2 text-sm transition-colors ${
                isActive 
                  ? 'bg-green-50/50 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Send className="h-4 w-4 text-gray-500" />
              <span>Sent</span>
            </div>
            <span className="text-xs text-gray-400">{sentData?.total || 0}</span>
          </NavLink>
        </nav>
      </div>

      {/* Settings / Integrations */}
      <div className="p-4 border-t border-gray-100">
        {slackStatus?.connected ? (
          <div className="flex w-full items-center justify-center gap-2 rounded border border-green-200 bg-green-50 py-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Slack Connected
          </div>
        ) : (
          <a 
            href="http://localhost:5000/api/integrations/slack/connect" 
            className="flex w-full items-center justify-center gap-2 rounded border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.164 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.164 18.958a2.528 2.528 0 0 1 2.521 2.52 2.528 2.528 0 0 1-2.521 2.522 2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.52 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52h-6.313z"/>
            </svg>
            Connect Slack
          </a>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
