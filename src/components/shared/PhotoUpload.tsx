import React, { useState } from 'react';
import { Upload, X, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  value?: string;
  onChange: (photoUrl: string) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  value, 
  onChange, 
  className, 
  label = "Foto",
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true);
      try {
        // Converter o arquivo para Data URL (pode ser usado para pré-visualização)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange(result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && !disabled) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) handleFileSelect(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
            "hover:border-primary hover:bg-primary/5",
            isDragging ? "border-primary bg-primary/10" : "border-border",
            value ? "border-solid border-primary" : "",
            disabled ? "opacity-50 cursor-not-allowed" : ""
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragEnter={() => {!disabled && setIsDragging(true);}}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => {!disabled && document.getElementById('photo-upload')?.click();}}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-foreground">Processando imagem...</p>
            </div>
          ) : value ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border-2 border-border"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  !disabled && onChange('');
                }}
                disabled={disabled}
                className={cn(
                  "absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80",
                  disabled ? "cursor-not-allowed opacity-50" : ""
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">
                  Clique para selecionar ou arraste uma foto
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou JPEG até 5MB
                </p>
              </div>
            </div>
          )}
        </div>
        
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default PhotoUpload;