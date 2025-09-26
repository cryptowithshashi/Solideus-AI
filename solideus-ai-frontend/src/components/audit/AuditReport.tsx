import React from 'react';
import VulnerabilityRow from './VulnerabilityRow';

interface Vulnerability {
  id: string;
  name: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

const mockVulnerabilities: Vulnerability[] = [
  {
    id: '1',
    name: 'Reentrancy',
    severity: 'High',
    description: 'A reentrancy vulnerability allows an attacker to repeatedly call a function within a single transaction, which can lead to unexpected behavior and loss of funds.',
  },
  {
    id: '2',
    name: 'Integer Overflow',
    severity: 'Medium',
    description: 'An integer overflow occurs when an arithmetic operation results in a number that is outside the range of the data type. This can lead to unexpected behavior and vulnerabilities.',
  },
  {
    id: '3',
    name: 'Unused Variable',
    severity: 'Low',
    description: 'An unused variable is a variable that is declared but never used. While not a direct security vulnerability, it can indicate dead code and make the contract harder to read and maintain.',
  },
];

const AuditReport: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold">Audit Report</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Found {mockVulnerabilities.length} vulnerabilities
        </p>
      </div>
      <div>
        {mockVulnerabilities.map((vulnerability) => (
          <VulnerabilityRow key={vulnerability.id} vulnerability={vulnerability} />
        ))}
      </div>
    </div>
  );
};

export default AuditReport;
