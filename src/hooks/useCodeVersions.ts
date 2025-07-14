import { useState, useCallback } from 'react';

export interface CodeVersion {
  id: string;
  code: string;
  prompt: string;
  model: string;
  timestamp: Date;
  title: string;
}

export const useCodeVersions = () => {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);

  const addVersion = useCallback((code: string, prompt: string, model: string) => {
    const version: CodeVersion = {
      id: `${Date.now()}-${Math.random()}`,
      code,
      prompt,
      model,
      timestamp: new Date(),
      title: `V${versions.length + 1}: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`
    };
    
    setVersions(prev => [version, ...prev]);
    setCurrentVersionId(version.id);
    return version;
  }, [versions.length]);

  const getCurrentVersion = useCallback(() => {
    return versions.find(v => v.id === currentVersionId);
  }, [versions, currentVersionId]);

  const switchToVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersionId(versionId);
      return version;
    }
    return null;
  }, [versions]);

  const deleteVersion = useCallback((versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
    if (currentVersionId === versionId) {
      const remaining = versions.filter(v => v.id !== versionId);
      setCurrentVersionId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [versions, currentVersionId]);

  return {
    versions,
    currentVersionId,
    addVersion,
    getCurrentVersion,
    switchToVersion,
    deleteVersion
  };
};