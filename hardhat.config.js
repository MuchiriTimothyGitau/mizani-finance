require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const FUJI_RPC_URL = process.env.FUJI_RPC_URL || 'https://api.avax-testnet.com/ext/bc/C/rpc';

module.exports = {
  solidity: '0.8.24',
  networks: {
    fuji: {
      url: FUJI_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 43113,
    },
  },
  etherscan: {
    apiKey: {
      fuji: process.env.SNOWTRACE_API_KEY || '',
    },
    customChains: [
      {
        network: 'fuji',
        chainId: 43113,
        urls: {
          apiURL: 'https://api-testnet.snowtrace.io/api',
          browserURL: 'https://testnet.snowtrace.io',
        },
      },
    ],
  },
};
