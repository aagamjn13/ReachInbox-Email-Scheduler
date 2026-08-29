import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useSenders } from '../../hooks/useSenders';
import { useScheduleEmails } from '../../hooks/useEmails';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import RecipientChips from '../../components/ui/RecipientChips';
import FileUpload from './FileUpload';
import RichTextEditor from './RichTextEditor';
import DateTimePicker from './DateTimePicker';

const ComposePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: senders, isLoading: isLoadingSenders } = useSenders();
  const scheduleMutation = useScheduleEmails();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [senderAccountId, setSenderAccountId] = useState('');
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  // Schedule settings
  const [startTime, setStartTime] = useState('');
  const [delayBetweenEmailsMs, setDelayBetweenEmailsMs] = useState(5000);
  const [hourlyLimit, setHourlyLimit] = useState(50);

  const handleAddRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = recipientInput.trim().replace(',', '');
      if (val && !recipients.includes(val)) {
        // Basic email validation
        if (/^\S+@\S+\.\S+$/.test(val)) {
          setRecipients([...recipients, val]);
          setRecipientInput('');
        } else {
          toast.error("Please enter a valid email address");
        }
      }
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleFileUpload = (newRecipients: string[]) => {
    const combined = [...new Set([...recipients, ...newRecipients])];
    setRecipients(combined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderAccountId) return toast.error("Please select a sender account");
    if (recipients.length === 0) return toast.error("Please add at least one recipient");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body.trim() || body === '<p></p>') return toast.error("Email body is required");

    try {
      await scheduleMutation.mutateAsync({
        senderAccountIds: [senderAccountId],
        recipients,
        subject,
        body,
        requestedStartTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        requestedDelayMs: Number(delayBetweenEmailsMs),
        requestedHourlyLimit: Number(hourlyLimit),
      });

      toast.success(startTime ? "Emails scheduled successfully!" : "Emails sending now!");
      navigate('/scheduled');
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule emails");
    }
  };

  // Get current datetime string for min attribute (YYYY-MM-DDThh:mm)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Compose New Email</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => toast.info('Attachments are not supported in this demo')} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsScheduleOpen(!isScheduleOpen)}
            >
              <Clock className="h-5 w-5" />
            </button>
          <div className="relative">
            <div className="flex items-center rounded-full border border-green-600 bg-white text-green-600 transition-colors">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={scheduleMutation.isPending}
                className="px-4 py-1.5 text-sm font-medium hover:bg-green-50 rounded-l-full"
              >
                {scheduleMutation.isPending ? 'Sending...' : 'Send'}
              </button>
              <div className="h-4 w-px bg-green-600 opacity-50"></div>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                className="px-2 py-1.5 hover:bg-green-50 rounded-r-full flex items-center justify-center"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
              {isScheduleOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 z-20 rounded-lg border border-gray-100 bg-white shadow-xl">
                  <div className="p-4">
                    <h4 className="mb-4 text-base font-semibold text-gray-900">Send Later</h4>
                    
                    <div className="relative mb-2">
                      <DateTimePicker
                        value={startTime}
                        onChange={setStartTime}
                        min={minDateTime}
                      />
                    </div>
                    
                    <div className="mt-4 flex flex-col space-y-1">
                      <button 
                        type="button" 
                        onClick={() => {
                          const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1); tmrw.setHours(9,0,0,0);
                          tmrw.setMinutes(tmrw.getMinutes() - tmrw.getTimezoneOffset());
                          setStartTime(tmrw.toISOString().slice(0,16));
                        }}
                        className="text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Tomorrow
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1); tmrw.setHours(10,0,0,0);
                          tmrw.setMinutes(tmrw.getMinutes() - tmrw.getTimezoneOffset());
                          setStartTime(tmrw.toISOString().slice(0,16));
                        }}
                        className="text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Tomorrow, 10:00 AM
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1); tmrw.setHours(11,0,0,0);
                          tmrw.setMinutes(tmrw.getMinutes() - tmrw.getTimezoneOffset());
                          setStartTime(tmrw.toISOString().slice(0,16));
                        }}
                        className="text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Tomorrow, 11:00 AM
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1); tmrw.setHours(15,0,0,0);
                          tmrw.setMinutes(tmrw.getMinutes() - tmrw.getTimezoneOffset());
                          setStartTime(tmrw.toISOString().slice(0,16));
                        }}
                        className="text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Tomorrow, 3:00 PM
                      </button>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 items-center">
                      <button
                        type="button"
                        onClick={() => setIsScheduleOpen(false)}
                        className="text-sm font-medium text-gray-900 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          setIsScheduleOpen(false);
                          if (startTime) handleSubmit(e);
                        }}
                        className="rounded-full border border-green-600 px-6 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        <form className="mx-auto flex h-full max-w-5xl flex-col" onSubmit={handleSubmit}>
          
          {/* From Row */}
          <div className="flex items-center border-b border-gray-100 px-8 py-3">
            <label className="w-20 text-sm text-gray-500 font-medium">From</label>
            <div className="relative">
              <select
                value={senderAccountId}
                onChange={(e) => setSenderAccountId(e.target.value)}
                className="appearance-none rounded-md bg-gray-50 py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={isLoadingSenders}
              >
                <option value="">Select a sender</option>
                {senders?.map((sender) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.email}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* To Row */}
          <div className="flex items-start border-b border-gray-100 px-8 py-3">
            <label className="mt-1.5 w-20 text-sm text-gray-500 font-medium">To</label>
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              <RecipientChips recipients={recipients} onRemove={handleRemoveRecipient} />
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleAddRecipient}
                placeholder={recipients.length === 0 ? "recipient@example.com" : ""}
                className="flex-1 border-none bg-transparent py-1.5 text-sm focus:outline-none focus:ring-0"
              />
            </div>
            <div className="ml-4 mt-1.5">
              <FileUpload onRecipientsParsed={handleFileUpload} />
            </div>
          </div>

          {/* Subject Row */}
          <div className="flex items-center border-b border-gray-100 px-8 py-3">
            <label className="w-20 text-sm text-gray-500 font-medium">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 border-none bg-transparent py-1 text-sm text-gray-900 focus:outline-none focus:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Settings Row */}
          <div className="flex items-center gap-8 border-b border-gray-100 px-8 py-3">
             <div className="flex items-center gap-3">
               <label className="text-sm text-gray-700 font-medium">Delay between 2 emails</label>
               <input 
                 type="number" 
                 value={delayBetweenEmailsMs} 
                 onChange={e => setDelayBetweenEmailsMs(Number(e.target.value))}
                 className="w-24 rounded border border-gray-200 bg-white px-2 py-1 text-sm text-center text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                 min={1000}
                 step={1000}
               />
             </div>
             <div className="flex items-center gap-3">
               <label className="text-sm text-gray-700 font-medium">Hourly Limit</label>
               <input 
                 type="number" 
                 value={hourlyLimit} 
                 onChange={e => setHourlyLimit(Number(e.target.value))}
                 className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-sm text-center text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                 min={1}
               />
             </div>
          </div>

          {/* Editor */}
          <div className="flex-1 px-8 py-6">
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Type Your Reply..."
            />
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default ComposePage;
