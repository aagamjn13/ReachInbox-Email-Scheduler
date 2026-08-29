import React from 'react';
import { Email } from '../../types';

interface StatusBadgeProps {
  status: Email['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'RATE_LIMITED':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusStyles()}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
