'use client';

import { ProjectFile } from '@/types';
import { Button } from '@/components/ui/button';
import { getFileIcon, getSeverityColor } from '@/lib/utils';
import { 
  Folder, 
  FolderOpen, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: string | null;
  onFileSelect: (fileName: string) => void;
}

export function FileTree({ files, selectedFile, onFileSelect }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['contracts', 'scripts', 'test']));

  // Group files by directory
  const filesByDirectory = files.reduce((acc, file) => {
    const parts = file.fileName.split('/');
    const directory = parts.length > 1 ? parts[0] : 'root';
    const fileName = parts[parts.length - 1];
    
    if (!acc[directory]) {
      acc[directory] = [];
    }
    
    acc[directory].push({
      ...file,
      displayName: fileName
    });
    
    return acc;
  }, {} as Record<string, Array<ProjectFile & { displayName: string }>>);

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusIcon = (file: ProjectFile) => {
    switch (file.scanStatus) {
      case 'safe':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'issues':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-3 max-h-64 overflow-y-auto">
      {Object.entries(filesByDirectory).map(([directory, dirFiles]) => (
        <div key={directory} className="mb-2">
          {/* Directory Header */}
          {directory !== 'root' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFolder(directory)}
              className="w-full justify-start h-6 px-1 mb-1"
            >
              {expandedFolders.has(directory) ? (
                <FolderOpen className="w-4 h-4 mr-2" />
              ) : (
                <Folder className="w-4 h-4 mr-2" />
              )}
              <span className="text-sm font-medium capitalize">{directory}</span>
            </Button>
          )}

          {/* Files */}
          {(directory === 'root' || expandedFolders.has(directory)) && (
            <div className={directory !== 'root' ? 'ml-4' : ''}>
              {dirFiles.map((file) => (
                <Button
                  key={file.fileName}
                  variant={selectedFile === file.fileName ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onFileSelect(file.fileName)}
                  className="w-full justify-start h-6 px-2 mb-1 font-mono text-xs"
                >
                  <span className="mr-2">{getFileIcon(file.fileName)}</span>
                  <span className="flex-1 text-left truncate">{file.displayName}</span>
                  {getStatusIcon(file)}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}

      {files.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No files generated yet
        </div>
      )}
    </div>
  );
}