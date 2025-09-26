export const API_ENDPOINTS = {
  // Auth
  AUTH_NONCE: '/api/auth/nonce',
  AUTH_CONNECT: '/api/auth/connect',
  AUTH_ME: '/api/auth/me',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // Chats
  CHATS: '/api/chats',
  CHAT_MESSAGES: (chatId: string) => `/api/chats/${chatId}/messages`,
  
  // Messages
  SEND_MESSAGE: (chatId: string) => `/api/messages/${chatId}`,
  
  // Files
  FILES: (chatId: string) => `/api/files/${chatId}`,
  FILE_CONTENT: (chatId: string, fileName: string) => `/api/files/${chatId}/${fileName}`,
  FILE_ANALYSIS: (chatId: string, fileName: string) => `/api/files/${chatId}/${fileName}/analysis`,
  
  // Fees
  FEE_INFO: '/api/fees/info',
  FEE_HISTORY: '/api/fees/history',
  FEE_STATUS: (txHash: string) => `/api/fees/status/${txHash}`,
} as const;

export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://sepolia.infura.io/v3/'] },
      public: { http: ['https://sepolia.infura.io/v3/'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
  },
} as const;

export const PROJECT_TEMPLATES = [
  {
    id: 'erc721-nft',
    title: 'ERC-721 NFT Collection',
    description: 'Create a standard NFT collection with minting and metadata',
    prompt: 'Create an ERC-721 NFT contract with minting functionality, owner controls, and metadata support',
  },
  {
    id: 'erc20-token',
    title: 'ERC-20 Token',
    description: 'Standard fungible token with basic functionality',
    prompt: 'Create an ERC-20 token contract with standard transfer, approve, and allowance functions',
  },
  {
    id: 'multisig-wallet',
    title: 'Multisig Wallet',
    description: 'Multi-signature wallet for secure fund management',
    prompt: 'Create a multisig wallet contract that requires multiple signatures for transactions',
  },
  {
    id: 'dao-governance',
    title: 'DAO Governance',
    description: 'Decentralized governance system with voting',
    prompt: 'Create a DAO governance contract with proposal creation, voting, and execution mechanisms',
  },
] as const;

export const SEVERITY_COLORS = {
  High: 'text-red-600 bg-red-50 border-red-200',
  Medium: 'text-orange-600 bg-orange-50 border-orange-200',
  Low: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  Informational: 'text-blue-600 bg-blue-50 border-blue-200',
} as const;

export const FILE_ICONS = {
  sol: '🔷',
  js: '🟨',
  ts: '🔷',
  json: '📋',
  md: '📝',
  txt: '📄',
  default: '📄',
} as const;