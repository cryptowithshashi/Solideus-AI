import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Code, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-solideus-primary rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Solideus AI</span>
            </div>
            <Link href="/dashboard">
              <Button variant="solideus">
                Launch App <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-solideus-primary via-solideus-secondary to-solideus-accent bg-clip-text text-transparent">
            Generate Smart Contracts with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Convert natural language into secure, audited Solidity code. Deploy to Sepolia testnet with 
            one-click safety analysis powered by Slither and AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="solideus" className="text-lg px-8 py-6">
                Start Building <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            End-to-End Smart Contract Development
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-solideus-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-solideus-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Generation</h3>
              <p className="text-muted-foreground">
                Transform natural language descriptions into production-ready Solidity code using 
                advanced language models.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-solideus-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-solideus-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Security Audit</h3>
              <p className="text-muted-foreground">
                Every contract is automatically analyzed with Slither static analysis and 
                AI-powered security reviews.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-solideus-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-solideus-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">One-Click Deploy</h3>
              <p className="text-muted-foreground">
                Deploy your audited contracts to Sepolia testnet with full provenance 
                tracking on IPFS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Connect Your Wallet',
                  description: 'Connect MetaMask or any Web3 wallet to get started. Your wallet handles all payments and signatures securely.',
                },
                {
                  step: '02', 
                  title: 'Describe Your Contract',
                  description: 'Tell our AI what kind of smart contract you want to build in plain English. Be specific about functionality and requirements.',
                },
                {
                  step: '03',
                  title: 'Pay Small Fee & Generate',
                  description: 'Pay a small fee in Sepolia ETH (≈$0.001) and watch as AI generates your complete Hardhat project with tests.',
                },
                {
                  step: '04',
                  title: 'Review & Audit',
                  description: 'Examine the generated code in our built-in editor. Automated security analysis highlights any potential issues.',
                },
                {
                  step: '05',
                  title: 'Deploy with Confidence',
                  description: 'One-click deployment to Sepolia testnet with full transaction tracking and IPFS provenance storage.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-solideus-primary text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers who are already using Solideus AI to create secure smart contracts faster than ever.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="solideus" className="text-lg px-8 py-6">
              Start Building Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-solideus-primary rounded flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Solideus AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Solideus AI. Built for the future of smart contract development.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}