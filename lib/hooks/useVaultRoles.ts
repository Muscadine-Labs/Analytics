'use client';

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { BASE_CHAIN_ID } from '@/lib/constants';
import { morphoGraphQLClient } from '@/lib/morpho/graphql-client';
import { gql } from 'graphql-request';

export interface VaultRolesData {
  owner: Address | null;
  curator: Address | null;
  feeRecipient: Address | null;
  guardian: Address | null;
  timelock: Address | null;
  pendingGuardian: Address | null;
  allocators: Address[];
}

/**
 * Hook to fetch vault roles and allocators from Morpho GraphQL
 */
export function useVaultRoles(vaultAddress: Address | null | undefined, chainId: number = BASE_CHAIN_ID) {
  return useQuery<VaultRolesData>({
    queryKey: ['vault-roles', vaultAddress, chainId],
    queryFn: async () => {
      if (!vaultAddress) {
        throw new Error('Vault address is required');
      }

      const query = gql`
        query VaultRoles($address: String!, $chainId: Int!) {
          vault: vaultByAddress(address: $address, chainId: $chainId) {
            state {
              owner
              curator
              feeRecipient
              guardian
              timelock
            }
            allocators {
              address
            }
          }
        }
      `;

      const data = await morphoGraphQLClient.request<{
        vault: {
          state?: {
            owner?: string | null;
            curator?: string | null;
            feeRecipient?: string | null;
            guardian?: string | null;
            timelock?: string | null;
          } | null;
          allocators?: Array<{ address: string }> | null;
        } | null;
      }>(query, {
        address: vaultAddress,
        chainId,
      });

      if (!data.vault) {
        throw new Error('Vault not found');
      }

      const allocators: Address[] = (data.vault.allocators || [])
        .map((a) => a.address as Address)
        .filter((addr) => addr && addr !== '0x0000000000000000000000000000000000000000');

      return {
        owner: (data.vault.state?.owner as Address) || null,
        curator: (data.vault.state?.curator as Address) || null,
        feeRecipient: (data.vault.state?.feeRecipient as Address) || null,
        guardian: (data.vault.state?.guardian as Address) || null,
        timelock: (data.vault.state?.timelock as Address) || null,
        pendingGuardian: null,
        allocators,
      };
    },
    enabled: !!vaultAddress,
  });
}

