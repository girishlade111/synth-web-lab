import { useState, useCallback } from 'react';

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
  createdAt: Date;
  modifiedAt: Date;
  isActive: boolean;
}

export interface FileManagerState {
  files: CodeFile[];
  activeFileId: string | null;
  selectedFileId: string | null;
}

export const useFileManager = () => {
  const [state, setState] = useState<FileManagerState>({
    files: [],
    activeFileId: null,
    selectedFileId: null
  });

  const addFile = useCallback((name: string, content: string, language: string = 'html') => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      content,
      language,
      path: `/${name}`,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isActive: false
    };

    setState(prev => ({
      ...prev,
      files: [...prev.files, newFile],
      activeFileId: newFile.id
    }));

    return newFile.id;
  }, []);

  const updateFile = useCallback((fileId: string, content: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, content, modifiedAt: new Date() }
          : file
      )
    }));
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setState(prev => {
      const newFiles = prev.files.filter(file => file.id !== fileId);
      const newActiveFileId = prev.activeFileId === fileId 
        ? (newFiles.length > 0 ? newFiles[0].id : null)
        : prev.activeFileId;

      return {
        ...prev,
        files: newFiles,
        activeFileId: newActiveFileId,
        selectedFileId: prev.selectedFileId === fileId ? null : prev.selectedFileId
      };
    });
  }, []);

  const setActiveFile = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      activeFileId: fileId,
      files: prev.files.map(file => ({
        ...file,
        isActive: file.id === fileId
      }))
    }));
  }, []);

  const setSelectedFile = useCallback((fileId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedFileId: fileId
    }));
  }, []);

  const renameFile = useCallback((fileId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, name: newName, path: `/${newName}`, modifiedAt: new Date() }
          : file
      )
    }));
  }, []);

  const getActiveFile = useCallback(() => {
    return state.files.find(file => file.id === state.activeFileId) || null;
  }, [state.files, state.activeFileId]);

  const getSelectedFile = useCallback(() => {
    return state.files.find(file => file.id === state.selectedFileId) || null;
  }, [state.files, state.selectedFileId]);

  const loadLocalFile = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileId = addFile(file.name, content, getLanguageFromExtension(file.name));
        resolve(fileId);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [addFile]);

  return {
    files: state.files,
    activeFileId: state.activeFileId,
    selectedFileId: state.selectedFileId,
    addFile,
    updateFile,
    deleteFile,
    setActiveFile,
    setSelectedFile,
    renameFile,
    getActiveFile,
    getSelectedFile,
    loadLocalFile
  };
};

const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'jsx':
      return 'javascript';
    case 'tsx':
      return 'typescript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'html';
  }
};