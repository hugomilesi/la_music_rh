
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
  showDeleteButton?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  size = 'md',
  showUploadButton = true,
  showDeleteButton = true
}) => {
  const { profile } = useAuth();
  const { uploadAvatar, deleteAvatar, isUploading } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    if (profile?.avatar_url) {
      deleteAvatar(profile.avatar_url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
          <AvatarFallback className="text-lg">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        
        {size === 'lg' && (
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showUploadButton && size !== 'lg' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Enviando...' : 'Upload'}
          </Button>
          
          {showDeleteButton && profile?.avatar_url && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
