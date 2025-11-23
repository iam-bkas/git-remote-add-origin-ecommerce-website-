
import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, CheckCircle, AlertCircle, Info, Mail } from 'lucide-react';

const NotificationToast = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto flex items-center p-4 rounded-lg shadow-lg border animate-fade-in-up
            ${notification.type === 'success' ? 'bg-white border-green-100 text-gray-800' : 
              notification.type === 'error' ? 'bg-white border-red-100 text-gray-800' :
              notification.type === 'email' ? 'bg-gray-900 border-gray-800 text-white' :
              'bg-white border-blue-100 text-gray-800'}
          `}
        >
          <div className={`
             flex-shrink-0 mr-3
             ${notification.type === 'success' ? 'text-green-500' : 
               notification.type === 'error' ? 'text-red-500' :
               notification.type === 'email' ? 'text-gray-300' :
               'text-blue-500'}
          `}>
             {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
             {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
             {notification.type === 'info' && <Info className="h-5 w-5" />}
             {notification.type === 'email' && <Mail className="h-5 w-5" />}
          </div>
          <div className="flex-1">
             {notification.type === 'email' && <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Email Simulator</p>}
             <p className={`text-sm font-medium ${notification.type === 'email' ? 'text-white' : 'text-gray-900'}`}>{notification.message}</p>
          </div>
          <button 
             onClick={() => removeNotification(notification.id)}
             className={`ml-3 flex-shrink-0 ${notification.type === 'email' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
