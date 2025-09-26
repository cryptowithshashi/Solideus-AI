import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";
import { FILE_ICONS, SEVERITY_COLORS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatEthAmount(weiAmount: string | bigint, decimals = 4): string {
  try {
    const ethAmount = formatEther(BigInt(weiAmount));
    return parseFloat(ethAmount).toFixed(decimals);
  } catch (error) {
    return '0.0000';
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return FILE_ICONS[extension as keyof typeof FILE_ICONS] || FILE_ICONS.default;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, fileName: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateSolidityCode(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation checks
  if (!code.includes('pragma solidity')) {
    errors.push('Missing pragma solidity directive');
  }
  
  if (!code.includes('contract ')) {
    errors.push('No contract declaration found');
  }
  
  // Check for common security issues (basic checks)
  if (code.includes('tx.origin')) {
    errors.push('Usage of tx.origin detected (security risk)');
  }
  
  if (code.includes('block.timestamp') && !code.includes('block.number')) {
    errors.push('Consider using block.number instead of block.timestamp for time-based logic');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getSeverityColor(severity: string): string {
  return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.Informational;
}

// Local storage helpers
export const storage = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },
  
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  },
  
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};