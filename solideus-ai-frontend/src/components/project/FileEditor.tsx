'use client';

import { useEffect, useState } from 'react';
import { ProjectFile } from '@/types';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { useChats } from '@/hooks/useChats';
import { 
  Copy, 
  Download, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Loader2,
  FileText
} from 'lucide-react';
import { copyToClipboard, downloadFile, getSeverityColor } from '@/lib/utils';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
  ssr: false,
});

interface FileEditorProps {
  selectedFile: string | null;
  files: ProjectFile[];
}

export function FileEditor({ selectedFile, files }: FileEditorProps) {
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { activeChat } = useChats();

  const currentFile = files.find(f => f.fileName === selectedFile);

  useEffect(() => {
    const loadFileContent = async () => {
      if (!selectedFile || !activeChat) return;

      // If we already have content, use it
      if (currentFile?.content) {
        setFileContent(currentFile.content);
        return;
      }

      // Otherwise, fetch from API
      setIsLoading(true);
      try {
        const response = await apiClient.get(
          API_ENDPOINTS.FILE_CONTENT(activeChat, selectedFile)
        );
        
        if (response.success) {
          setFileContent(response.data.content || '');
        }
      } catch (error) {
        console.error('Failed to load file:', error);
        toast.error('Failed to load file content');
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [selectedFile, activeChat, currentFile]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(fileContent);
      toast.success('File content copied!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    
    downloadFile(fileContent, selectedFile);
    toast.success('File downloaded!');
  };

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sol':
        return 'solidity';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  const renderSecurityStatus = () => {
    if (!currentFile) return null;

    const { scanStatus, slitherResults } = currentFile;
    
    switch (scanStatus) {
      case 'safe':
        return (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Security scan passed</span>
            {slitherResults && (
              <span className="text-xs">Score: {slitherResults.score}/100</span>
            )}
          </div>
        );
      case 'issues':
        return (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Security issues found</span>
            {slitherResults && (
              <span className="text-xs">Score: {slitherResults.score}/100</span>
            )}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Scan failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>Scanning...</span>
          </div>
        );
    }
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center text-center text-muted-foreground">
        <div>
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a file to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File Header */}
      <div className="flex-shrink-0 border-b p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium font-mono">{selectedFile}</span>
            {currentFile && (
              <span className="text-xs text-muted-foreground">
                ({currentFile.fileType})
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Security Status */}
        {renderSecurityStatus()}
      </div>

      {/* File Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading file...</span>
          </div>
        ) : (
          <MonacoEditor
            value={fileContent}
            language={getLanguageFromFileName(selectedFile)}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
            }}
          />
        )}
      </div>

      {/* Security Details */}
      {currentFile?.slitherResults && (
        <div className="flex-shrink-0 border-t p-3 bg-muted/20">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Security Analysis</span>
            </div>
            
            {currentFile.slitherResults.findings.length > 0 ? (
              <div className="space-y-1">
                {currentFile.slitherResults.findings.slice(0, 3).map((finding, index) => (
                  <div key={index} className="text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className="ml-2">{finding.title}</span>
                  </div>
                ))}
                {currentFile.slitherResults.findings.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{currentFile.slitherResults.findings.length - 3} more issues
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-green-600">No security issues found!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}