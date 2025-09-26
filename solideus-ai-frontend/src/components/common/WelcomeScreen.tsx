'use client';

import { useChats } from '@/hooks/useChats';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { PROJECT_TEMPLATES } from '@/lib/constants';
import { Plus, Sparkles, Code2, Shield, Zap } from 'lucide-react';

export function WelcomeScreen() {
  const { createNewChat } = useChats();
  const { user } = useWallet();

  const handleTemplateSelect = (template: typeof PROJECT_TEMPLATES[0]) => {
    createNewChat();
    // Note: In a real implementation, you'd want to pre-fill the chat with the template prompt
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome{user?.name ? ` back, ${user.name}` : ' to Solideus AI'}! 
            <Sparkles className="inline-block ml-2 w-8 h-8 text-solideus-primary" />
          </h1>
          <p className="text-xl text-muted-foreground">
            Generate secure smart contracts with AI assistance. Start a new chat or choose a template below.
          </p>
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <Button 
            size="lg" 
            variant="solideus" 
            onClick={() => createNewChat()}
            className="text-lg px-8 py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Chat
          </Button>
        </div>

        {/* Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Popular Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="w-12 h-12 bg-solideus-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-solideus-primary/20 transition-colors">
                  <Code2 className="w-6 h-6 text-solideus-primary" />
                </div>
                <h3 className="font-semibold mb-2">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-solideus-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-solideus-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Generate complete Solidity projects from natural language descriptions
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-solideus-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-solideus-secondary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Security First</h3>
              <p className="text-sm text-muted-foreground">
                Automated Slither analysis and AI security reviews for every contract
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-solideus-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-solideus-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">One-Click Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Deploy to Sepolia testnet with full provenance tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}