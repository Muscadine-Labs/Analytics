'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Address } from 'viem';
import { BASE_CHAIN_ID } from '@/lib/constants';
import { useVaultRoles } from '@/lib/hooks/useVaultRoles';
import { AddressBadge } from './AddressBadge';
import { getScanUrlForChain } from '@/lib/constants';

interface RoleListProps {
  vaultAddress: Address;
  chainId?: number;
}

export function RoleList({ vaultAddress, chainId = BASE_CHAIN_ID }: RoleListProps) {
  const { data: roles, isLoading } = useVaultRoles(vaultAddress, chainId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading roles...</div>
        </CardContent>
      </Card>
    );
  }

  if (!roles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load roles</div>
        </CardContent>
      </Card>
    );
  }

  const roleItems = [
    { name: 'Owner', address: roles.owner, description: 'Safe multisig with protocol ownership', pendingAddress: null as string | null },
    { name: 'Curator', address: roles.curator, description: 'Configures markets and risk parameters', pendingAddress: null as string | null },
    { name: 'Fee Recipient', address: roles.feeRecipient, description: 'Receives vault performance fees', pendingAddress: null as string | null },
    { name: 'Guardian', address: roles.guardian, description: 'Safe multisig with guardian privileges', pendingAddress: roles.pendingGuardian ?? null },
  ];

  const scanUrl = getScanUrlForChain(chainId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roleItems.map((role) => (
          <div key={role.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="outline">{role.name}</Badge>
                {role.address ? (
                  <AddressBadge address={role.address} scanUrl={`${scanUrl}/address/${role.address}`} />
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
                {role.pendingAddress && (
                  <Badge variant="secondary" className="text-xs">
                    Pending: {role.pendingAddress}
                  </Badge>
                )}
              </div>
              {role.address && (
                <a
                  href={`https://app.safe.global/home?safe=base:${role.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-2"
                >
                  Safe <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
