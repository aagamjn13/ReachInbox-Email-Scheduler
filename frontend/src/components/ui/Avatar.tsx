import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', fallback }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const baseStyles = 'relative flex shrink-0 overflow-hidden rounded-full items-center justify-center bg-gray-100 text-gray-600';

  return (
    <div className={`${baseStyles} ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="aspect-square h-full w-full object-cover" />
      ) : fallback ? (
        <span className="font-medium uppercase">{fallback.substring(0, 2)}</span>
      ) : (
        <UserIcon className="h-1/2 w-1/2" />
      )}
    </div>
  );
};

export default Avatar;
