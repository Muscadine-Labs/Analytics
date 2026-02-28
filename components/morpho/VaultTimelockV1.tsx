'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVault } from '@/lib/hooks/useProtocolStats';
import { useQuery } from '@tanstack/react-query';
import { multicallRead } from '@/lib/onchain/client';
import type { Address } from 'viem';

const TIMELOCK_ABI = [
  { name: 'timelockDuration', type: 'function' as const, stateMutability: 'view' as const, inputs: [] as const, outputs: [{ name: '', type: 'uint256' }] as const },
] as const;

function formatTimelockDuration(seconds: number | null): string {
  if (!seconds) return 'Not available';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}${hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

interface VaultTimelockV1Props {
  vaultAddress: string;
}

export function VaultTimelockV1({ vaultAddress }: VaultTimelockV1Props) {
  const { data: vault } = useVault(vaultAddress);

  const { data: timelockSeconds, isLoading } = useQuery({
    queryKey: ['vault-timelock', vaultAddress],
    queryFn: async () => {
      const [result] = await multicallRead<bigint>([
        { address: vaultAddress as Address, abi: TIMELOCK_ABI, functionName: 'timelockDuration' },
      ]);
      return result != null ? Number(result) : null;
    },
    enabled: !!vaultAddress,
  });

  const seconds =
    typeof vault?.roles?.timelock === 'number'
      ? vault.roles.timelock
      : timelockSeconds ?? null;

  const value = formatTimelockDuration(seconds);
  const loading = isLoading && typeof vault?.roles?.timelock !== 'number';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Timelock Duration</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">Delay before allocation changes take effect</p>
      </CardContent>
    </Card>
  );
}
