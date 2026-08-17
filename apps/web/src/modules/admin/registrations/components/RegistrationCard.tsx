"use client";

import { Badge, type BadgeIntent, Button, cn, ListItemCard, Text } from "@job-tracker/ui";

import { UserStatus } from "@/gql/graphql";

interface RegistrationCardData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
}

interface RegistrationCardProps {
  registration: RegistrationCardData;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  isMutating: boolean;
}

const STATUS_BADGE_INTENT: Record<UserStatus, BadgeIntent> = {
  [UserStatus.Pending]: "warning",
  [UserStatus.Active]: "success",
  [UserStatus.Rejected]: "error",
  [UserStatus.Deactivated]: "default",
};

export function RegistrationCard({ registration, onApprove, onReject, isMutating }: RegistrationCardProps) {
  const isPending = registration.status === UserStatus.Pending;
  const requestedAt = new Date(registration.createdAt).toLocaleDateString();

  return (
    <ListItemCard
      title={
        <ListItemCard.Title>
          <Text as="span" size="base" weight="semibold" className={cn("wrap-break-word")}>
            {registration.name}
          </Text>
        </ListItemCard.Title>
      }
      actions={
        isPending ? (
          <ListItemCard.Actions>
            <Button
              intent="secondary"
              size="xs"
              disabled={isMutating}
              onClick={() => onApprove(registration.id)}
              aria-label={`Approve ${registration.name}`}
            >
              Approve
            </Button>
            <Button
              intent="destructive"
              size="xs"
              disabled={isMutating}
              onClick={() => onReject(registration.id)}
              aria-label={`Reject ${registration.name}`}
            >
              Reject
            </Button>
          </ListItemCard.Actions>
        ) : undefined
      }
      meta={
        <>
          <Text as="span" size="sm" color="muted">
            {registration.email}
          </Text>
          <Badge intent={STATUS_BADGE_INTENT[registration.status]}>{registration.status}</Badge>
        </>
      }
      description={
        <Text as="span" size="xs" color="muted">
          Requested {requestedAt}
        </Text>
      }
    />
  );
}
