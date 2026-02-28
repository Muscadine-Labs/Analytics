'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressBadge } from './AddressBadge';
import { BASE_CHAIN_ID, getScanUrlForChain } from '@/lib/constants';
import { useVaultRoles } from '@/lib/hooks/useVaultRoles';
import type { Address } from 'viem';

interface AllocatorListProps {
  vaultAddress: Address;
  chainId?: number;
}

export function AllocatorList({ vaultAddress, chainId = BASE_CHAIN_ID }: AllocatorListProps) {
  const { data: roles, isLoading } = useVaultRoles(vaultAddress, chainId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading allocators...</div>
        </CardContent>
      </Card>
    );
  }

  if (!roles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load allocators</div>
        </CardContent>
      </Card>
    );
  }

  const scanUrl = getScanUrlForChain(chainId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.allocators.length > 0 ? (
          <div className="space-y-3">
            {roles.allocators.map((allocator, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Allocator</Badge>
                  <AddressBadge
                    address={allocator}
                    scanUrl={`${scanUrl}/address/${allocator}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No allocators configured
          </div>
        )}
      </CardContent>
    </Card>
  );
}
