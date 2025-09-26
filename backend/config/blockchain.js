const { ethers } = require('ethers');

// Sepolia provider via Alchemy
const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);

// Treasury wallet for collecting fees
const treasuryWallet = new ethers.Wallet(process.env.TREASURY_PRIVATE_KEY, provider);

// Fee amount (0.001 ETH in Wei)
const FEE_AMOUNT_WEI = ethers.parseEther('0.001');

module.exports = {
    provider,
    treasuryWallet,
    FEE_AMOUNT_WEI
};