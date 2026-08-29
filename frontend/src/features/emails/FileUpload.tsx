import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onRecipientsParsed: (recipients: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onRecipientsParsed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      Papa.parse(file, {
        complete: (results) => {
          const emails: string[] = [];
          
          results.data.forEach((row: any) => {
            // Find email in row
            if (Array.isArray(row)) {
              row.forEach(cell => {
                if (typeof cell === 'string' && validateEmail(cell.trim())) {
                  emails.push(cell.trim());
                }
              });
            } else if (typeof row === 'object' && row !== null) {
              Object.values(row).forEach(cell => {
                if (typeof cell === 'string' && validateEmail(cell.trim())) {
                  emails.push(cell.trim());
                }
              });
            }
          });

          if (emails.length > 0) {
            onRecipientsParsed([...new Set(emails)]); // Remove duplicates
            toast.success(`Successfully extracted ${emails.length} valid email addresses.`);
          } else {
            toast.error("No valid email addresses found in the file.");
          }
        },
        error: (error) => {
          toast.error("Error parsing file: " + error.message);
        },
        skipEmptyLines: true,
      });
    } else {
      toast.error("Please upload a .csv or .txt file.");
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.txt"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 focus:outline-none"
      >
        <Upload className="h-4 w-4" />
        Upload List
      </button>
    </>
  );
};

export default FileUpload;
