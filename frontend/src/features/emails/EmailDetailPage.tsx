import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useEmail } from '../../hooks/useEmails';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import Avatar from '../../components/ui/Avatar';

const EmailDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: email, isLoading } = useEmail(id || '');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <LoadingState />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-gray-500">Email not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar */}
      <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
        <button 
          onClick={() => navigate(-1)}
          className="rounded p-1 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 truncate text-xl font-semibold text-gray-900">
          {email.subject || '(No subject)'}
        </h1>
        <StatusBadge status={email.status} />
        {email.etherealPreviewUrl && (
          <a
            href={email.etherealPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            View in Ethereal
          </a>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header Info */}
          <div className="flex items-start justify-between rounded-lg border border-gray-200 p-6">
            <div className="flex gap-4">
              <Avatar fallback={email.senderAccount.displayName} />
              <div>
                <p className="font-medium text-gray-900">{email.senderAccount.displayName}</p>
                <p className="text-sm text-gray-500">From: {email.senderAccount.email}</p>
                <p className="mt-1 text-sm text-gray-500">To: {email.recipient}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {email.sentAt 
                  ? `Sent: ${format(new Date(email.sentAt), 'MMM d, yyyy h:mm a')}`
                  : `Scheduled: ${format(new Date(email.scheduledAt), 'MMM d, yyyy h:mm a')}`
                }
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Campaign ID: {email.campaignId}
              </p>
            </div>
          </div>

          {/* Failure Reason if failed */}
          {email.status === 'FAILED' && email.failureReason && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <span className="font-medium">Delivery failed: </span>
              {email.failureReason}
            </div>
          )}

          {/* Body */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div 
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetailPage;
