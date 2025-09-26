'use client';

import { useState } from 'react';
import { useChats } from '@/hooks/useChats';
import { Button } from '@/components/ui/button';
import { FileTree } from './FileTree';
import { FileEditor } from './FileEditor';
import { 
  Files, 
  Download, 
  Shield, 
  Rocket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { downloadFile } from '@/lib/utils';
import { toast } from 'sonner';

export function ProjectPanel() {
  const { projectFiles, activeChat } = useChats();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDownloadAll = () => {
    if (projectFiles.length === 0) {
      toast.error('No files to download');
      return;
    }

    // Create a simple zip-like structure (just concatenated files for demo)
    const allFilesContent = projectFiles
      .map(file => `// ===== ${file.fileName} =====\n\n${file.content}\n\n`)
      .join('');
    
    downloadFile(allFilesContent, `solideus-project-${Date.now()}.txt`, 'text/plain');
    toast.success('Project files downloaded!');
  };

  const handleAudit = () => {
    toast.info('Security audit started! Results will appear shortly.');
    // In real implementation, this would trigger the audit process
  };

  const handleDeploy = () => {
    toast.info('Deployment feature coming soon!');
    // In real implementation, this would open deployment modal
  };

  if (!activeChat || projectFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="text-muted-foreground">
          <Files className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No project files yet.</p>
          <p className="text-sm mt-1">Generate a smart contract to see files here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-96'}`}>
      {/* Header */}
      <div className="flex-shrink-0 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Files className="w-5 h-5" />
            {!isCollapsed && <h3 className="font-semibold">Project Files</h3>}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {!isCollapsed && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={handleDownloadAll}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={handleAudit}>
              <Shield className="w-3 h-3 mr-1" />
              Audit
            </Button>
            <Button size="sm" variant="outline" onClick={handleDeploy}>
              <Rocket className="w-3 h-3 mr-1" />
              Deploy
            </Button>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* File Tree */}
          <div className="flex-shrink-0 border-b">
            <FileTree
              files={projectFiles}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>

          {/* File Editor/Preview */}
          <div className="flex-1 min-h-0">
            <FileEditor
              selectedFile={selectedFile}
              files={projectFiles}
            />
          </div>
        </>
      )}
    </div>
  );
}