// Simplified vault config - only stores addresses
// All other data (name, symbol, asset, performance fee, etc.) is fetched from GraphQL
export interface VaultAddressConfig {
  address: string;
  chainId: number;
}

import { BASE_CHAIN_ID } from '@/lib/constants';

// Vault addresses only - all other data fetched from GraphQL
export const vaultAddresses: VaultAddressConfig[] = [
  // V2 Prime Vaults
  {
    address: process.env.NEXT_PUBLIC_VAULT_USDC_V2 || '0x89712980Cb434eF5aE4AB29349419eb976B0b496',
    chainId: BASE_CHAIN_ID,
  },
  {
    address: process.env.NEXT_PUBLIC_VAULT_WETH_V2 || '0xd6dcad2f7da91fbb27bda471540d9770c97a5a43',
    chainId: BASE_CHAIN_ID,
  },
  {
    address: process.env.NEXT_PUBLIC_VAULT_CBBTC_V2 || '0x99dcd0d75822ba398f13b2a8852b07c7e137ec70',
    chainId: BASE_CHAIN_ID,
  },
  // V1 Vaults
  {
    address: process.env.NEXT_PUBLIC_VAULT_USDC || '0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F',
    chainId: BASE_CHAIN_ID,
  },
  {
    address: process.env.NEXT_PUBLIC_VAULT_CBBTC || '0xAeCc8113a7bD0CFAF7000EA7A31afFD4691ff3E9',
    chainId: BASE_CHAIN_ID,
  },
  {
    address: process.env.NEXT_PUBLIC_VAULT_WETH || '0x21e0d366272798da3A977FEBA699FCB91959d120',
    chainId: BASE_CHAIN_ID,
  },
];

// Helper functions
export const getVaultByAddress = (address: string): VaultAddressConfig | undefined => {
  return vaultAddresses.find(vault => vault.address.toLowerCase() === address.toLowerCase());
};

export const getAllVaultAddresses = (): VaultAddressConfig[] => {
  return vaultAddresses;
};

// Categorize vaults by name pattern (works with GraphQL data)
export type VaultCategory = 'prime' | 'vineyard' | 'v1';

export const getVaultCategory = (vaultName: string | null | undefined): VaultCategory => {
  if (!vaultName) {
    return 'v1'; // Default to v1 if name is missing
  }
  const name = vaultName.toLowerCase();
  if (name.includes('prime')) {
    return 'prime';
  }
  if (name.includes('vineyard')) {
    return 'vineyard';
  }
  return 'v1';
};

// Determine if vault should use v2 GraphQL query (Prime and Vineyard are both v2)
export const shouldUseV2Query = (vaultName: string | null | undefined): boolean => {
  const category = getVaultCategory(vaultName);
  return category === 'prime' || category === 'vineyard';
};
