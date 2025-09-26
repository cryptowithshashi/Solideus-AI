'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, User, BookOpen, Code } from 'lucide-react';

export function OnboardingModal() {
  const { completeOnboarding, needsOnboarding } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    projectType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding(formData);
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!needsOnboarding) {
    return null;
  }

  return (
    <Dialog open={needsOnboarding}>
      <DialogContent className="max-w-md" closeButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Sparkles className="w-6 h-6 text-solideus-primary" />
            Welcome to Solideus AI!
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              What should we call you?
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              What's your blockchain development experience?
            </Label>
            <RadioGroup
              value={formData.experience}
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                setFormData({ ...formData, experience: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="text-sm">
                  <span className="font-medium">Beginner</span> - New to smart contracts
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="text-sm">
                  <span className="font-medium">Intermediate</span> - Some Solidity experience
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="text-sm">
                  <span className="font-medium">Advanced</span> - Experienced developer
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              What type of project are you most interested in? (Optional)
            </Label>
            <Select
              value={formData.projectType}
              onValueChange={(value) => setFormData({ ...formData, projectType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nft">NFT Collections</SelectItem>
                <SelectItem value="token">ERC-20 Tokens</SelectItem>
                <SelectItem value="defi">DeFi Protocols</SelectItem>
                <SelectItem value="dao">DAO Governance</SelectItem>
                <SelectItem value="marketplace">Marketplaces</SelectItem>
                <SelectItem value="game">Gaming</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            variant="solideus"
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Setting up...' : 'Get Started'}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          This information helps us provide better AI-generated contracts for your needs.
        </div>
      </DialogContent>
    </Dialog>
  );
}