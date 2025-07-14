import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FolderOpen, 
  File, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload,
  Tag,
  Check,
  X
} from 'lucide-react';
import { CodeFile } from '../hooks/useFileManager';

interface FileManagerProps {
  files: CodeFile[];
  activeFileId: string | null;
  selectedFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileCreate: (name: string, content: string) => void;
  onLocalFileLoad: (file: File) => Promise<string>;
  onFileTag: (fileId: string | null) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  activeFileId,
  selectedFileId,
  onFileSelect,
  onFileDelete,
  onFileRename,
  onFileCreate,
  onLocalFileLoad,
  onFileTag
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingFileId, setEditingFileId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        onLocalFileLoad(file);
      });
    }
  };

  const handleRename = (fileId: string, currentName: string) => {
    setEditingFileId(fileId);
    setEditingName(currentName);
  };

  const saveRename = () => {
    if (editingFileId && editingName.trim()) {
      onFileRename(editingFileId, editingName.trim());
    }
    setEditingFileId(null);
    setEditingName('');
  };

  const cancelRename = () => {
    setEditingFileId(null);
    setEditingName('');
  };

  const createNewFile = () => {
    const name = prompt('Enter file name:');
    if (name) {
      onFileCreate(name, '');
    }
  };

  const getFileIcon = (language: string) => {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'css':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          <span className="font-semibold">Files</span>
          <Badge variant="secondary">{files.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={createNewFile}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".html,.css,.js,.ts,.jsx,.tsx,.json,.md"
        className="hidden"
      />

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              activeFileId === file.id
                ? 'border-primary bg-primary/10'
                : selectedFileId === file.id
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {getFileIcon(file.language)}
                {editingFileId === file.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      onKeyPress={(e) => e.key === 'Enter' && saveRename()}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveRename}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelRename}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium truncate flex-1">
                    {file.name}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {selectedFileId === file.id && (
                  <Badge variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    Tagged
                  </Badge>
                )}
                {activeFileId === file.id && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileTag(selectedFileId === file.id ? null : file.id);
                  }}
                >
                  <Tag className={`h-3 w-3 ${selectedFileId === file.id ? 'text-primary' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(file.id, file.name);
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileDelete(file.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              <div>Modified: {file.modifiedAt.toLocaleTimeString()}</div>
              <div>{file.content.length} characters</div>
            </div>
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No files yet</p>
            <p className="text-xs">Create a new file or upload existing ones</p>
          </div>
        )}
      </div>
    </Card>
  );
};