import React, { useState, ReactNode } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '@/components/ui/button';

interface EditableSectionProps {
  children: ReactNode;
  editContent?: ReactNode;
  onSave?: (data: any) => void;
  className?: string;
}

const EditableSection: React.FC<EditableSectionProps> = ({
  children,
  editContent,
  onSave,
  className = ""
}) => {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({});
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Edit overlay */}
      <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Edit button */}
      {!isEditing && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="relative">
          {editContent || children}
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="w-3 h-3 mr-1" />
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-3 h-3 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default EditableSection;