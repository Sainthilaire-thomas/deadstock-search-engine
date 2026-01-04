// src/features/boards/components/NoteEditor.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NoteEditorProps {
  content: string;
  color: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function NoteEditor({ content, color, onSave, onCancel }: NoteEditorProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus et sélectionne tout le texte au montage
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSave(value);
    }
  };

  return (
    <div 
      className="absolute inset-0 p-2 flex flex-col"
      style={{ backgroundColor: color }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none border-none bg-transparent text-gray-800 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Écrivez votre note..."
      />
      <div className="flex justify-end gap-1 mt-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onCancel}
          className="h-7 px-2 text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          onClick={() => onSave(value)}
          className="h-7 px-2"
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-[10px] text-gray-500 mt-1">
        Ctrl+Entrée pour sauvegarder • Échap pour annuler
      </p>
    </div>
  );
}
