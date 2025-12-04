import React from 'react';
import { Edit3, Eye } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '@/components/ui/button';

const EditModeToggle: React.FC = () => {
  const { isEditMode, toggleEditMode } = useEditMode();

  return (
    <Button
      onClick={toggleEditMode}
      variant={isEditMode ? "default" : "outline"}
      size="sm"
      className={`
        fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-academy-glow transition-all
        ${isEditMode 
          ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-academy-glow' 
          : 'bg-card hover:bg-muted border-border'
        }
      `}
    >
      {isEditMode ? (
        <Eye className="w-5 h-5" />
      ) : (
        <Edit3 className="w-5 h-5" />
      )}
    </Button>
  );
};

export default EditModeToggle;