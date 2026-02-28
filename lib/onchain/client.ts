import { createPublicClient, http, Address, Abi } from 'viem';
import { base } from 'viem/chains';
import { logger } from '@/lib/utils/logger';

// Determine RPC URL based on available API keys
// Priority: ALCHEMY_API_KEY > COINBASE_CDP_API_KEY > demo fallback
function getRpcUrl(): string {
  // Alchemy (primary)
  if (process.env.ALCHEMY_API_KEY) {
    return `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  }
  
  // Coinbase CDP fallback (if using CDP RPC service)
  // Format may be: https://base-mainnet.cdp.coinbase.com/v1/[API_KEY]
  // Or: https://base.cdp.coinbase.com/[API_KEY]
  // Check Coinbase CDP docs for exact endpoint format
  if (process.env.COINBASE_CDP_API_KEY) {
    return `https://base-mainnet.cdp.coinbase.com/v1/${process.env.COINBASE_CDP_API_KEY}`;
  }
  
  // Demo fallback (rate limited)
  return 'https://base-mainnet.g.alchemy.com/v2/demo';
}

// Base chain configuration (used by publicClient)
const baseChain = {
  ...base,
  rpcUrls: {
    default: {
      http: [getRpcUrl()],
    },
    public: {
      http: [getRpcUrl()],
    },
  },
};

// Public client for risk (oracle, IRM) and overview (timelock) reads only
export const publicClient = createPublicClient({
  chain: baseChain,
  transport: http(),
});

// Helper function to safely read contract data
export const safeContractRead = async <T>(
  contractAddress: Address,
  abi: Abi,
  functionName: string,
  args: unknown[] = []
): Promise<T | null> => {
  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName,
      args,
    });
    return result as T;
  } catch (error) {
    logger.warn(`Failed to read ${functionName} from ${contractAddress}`, {
      contractAddress,
      functionName,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return null;
  }
};

// Helper function for multicall
export const multicallRead = async <T>(
  contracts: Array<{
    address: Address;
    abi: Abi;
    functionName: string;
    args?: unknown[];
  }>
): Promise<(T | null)[]> => {
  try {
    const results = await publicClient.multicall({
      contracts: contracts.map(contract => ({
        address: contract.address,
        abi: contract.abi,
        functionName: contract.functionName,
        args: contract.args || [],
      })),
    });
    
    return results.map(result => {
      if (result.status === 'success') {
        return result.result as T;
      }
      return null;
    });
  } catch (error) {
    logger.warn('Multicall failed', {
      contractCount: contracts.length,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return contracts.map(() => null);
  }
};
