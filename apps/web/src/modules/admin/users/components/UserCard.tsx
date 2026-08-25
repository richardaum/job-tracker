"use client";

import {
  Badge,
  type BadgeIntent,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuItem,
  IconButton,
  ListItemCard,
  Text,
  cn,
} from "@job-tracker/ui";
import { DotsThreeOutlineVerticalIcon } from "@phosphor-icons/react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useState } from "react";

import { UserStatus } from "@/gql/graphql";

const RESEND_APPROVAL_EMAIL_FLAG = "registration-approved-user-email-enabled";

interface UserCardData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  status: UserStatus;
  createdAt: string;
}

interface UserCardProps {
  user: UserCardData;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onResendApprovalEmail: (userId: string) => void;
  onRemove: (userId: string) => void;
  isMutating: boolean;
}

const STATUS_BADGE_INTENT: Record<UserStatus, BadgeIntent> = {
  [UserStatus.Pending]: "warning",
  [UserStatus.Active]: "success",
  [UserStatus.Rejected]: "error",
  [UserStatus.Deactivated]: "default",
};

export function UserCard({ user, onApprove, onReject, onResendApprovalEmail, onRemove, isMutating }: UserCardProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const resendApprovalEmailEnabled = useFeatureFlagEnabled(RESEND_APPROVAL_EMAIL_FLAG) ?? false;
  const isPending = user.status === UserStatus.Pending;
  const isActive = user.status === UserStatus.Active;
  const hasActions = isPending || isActive;
  const requestedAt = new Date(user.createdAt).toLocaleDateString();

  return (
    <ListItemCard
      title={
        <ListItemCard.Title>
          <Text as="span" size="base" weight="semibold" className={cn("wrap-break-word")}>
            {user.name}
          </Text>
        </ListItemCard.Title>
      }
      actions={
        hasActions ? (
          <ListItemCard.Actions>
            <DropdownMenu
              align="end"
              trigger={
                <IconButton
                  intent="ghost"
                  size="sm"
                  label={`Actions for ${user.name}`}
                  tooltip="Actions"
                  disabled={isMutating}
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<DotsThreeOutlineVerticalIcon size={13} weight="fill" />}
                />
              }
            >
              {isPending ? (
                <>
                  <DropdownMenuItem disabled={isMutating} onSelect={() => onApprove(user.id)}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem destructive disabled={isMutating} onSelect={() => onReject(user.id)}>
                    Reject
                  </DropdownMenuItem>
                </>
              ) : null}
              {isActive ? (
                <>
                  {resendApprovalEmailEnabled ? (
                    <DropdownMenuItem disabled={isMutating} onSelect={() => onResendApprovalEmail(user.id)}>
                      Resend approval email
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem destructive disabled={isMutating} onSelect={() => setRemoveDialogOpen(true)}>
                    Remove user
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenu>
            <ConfirmDialog
              open={removeDialogOpen}
              onOpenChange={setRemoveDialogOpen}
              title="Remove user"
              description={`Are you sure you want to remove "${user.name}"? Their account will be deactivated and they won't be able to sign back in.`}
              confirmLabel="Remove"
              onConfirm={() => onRemove(user.id)}
            />
          </ListItemCard.Actions>
        ) : undefined
      }
      meta={
        <>
          <Text as="span" size="sm" color="muted">
            {user.email}
          </Text>
          <Badge intent={STATUS_BADGE_INTENT[user.status]}>{user.status}</Badge>
        </>
      }
      description={
        <Text as="span" size="xs" color="muted">
          {user.role} · Requested {requestedAt}
        </Text>
      }
    />
  );
}
