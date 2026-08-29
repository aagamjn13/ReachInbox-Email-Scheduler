import React from 'react';
import Input from '../../components/ui/Input';

interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ label, value, onChange, min }) => {
  return (
    <Input
      type="datetime-local"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      className="w-full"
    />
  );
};

export default DateTimePicker;
