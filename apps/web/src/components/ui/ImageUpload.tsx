import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({ value, onChange, disabled, className }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // POST to generic /upload endpoint
      const response = await api.post('upload', { body: formData }).json<{ url: string }>();
      onChange(response.url);
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative group">
        <Avatar src={value} alt="Upload" size="lg" className="h-20 w-20 border-2 border-border" />

        {value && !disabled && (
           <button
             type="button"
             onClick={handleRemove}
             className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
             title="Remove image"
           >
             <X className="w-3 h-3" />
           </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="relative"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {value ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
            JPG, PNG or WEBP. Max 5MB.
        </p>

        <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            disabled={disabled || isUploading}
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
            }}
        />
      </div>
    </div>
  );
};
