"use client";

import { cn, ListItemCard, Text } from "@job-tracker/ui";

interface UserCardData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

interface UserCardProps {
  user: UserCardData;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <ListItemCard
      title={
        <ListItemCard.Title>
          <Text as="span" size="base" weight="semibold" className={cn("wrap-break-word")}>
            {user.name}
          </Text>
        </ListItemCard.Title>
      }
      meta={
        <Text as="span" size="sm" color="muted">
          {user.email}
        </Text>
      }
      description={
        <Text as="span" size="xs" color="muted">
          {user.role}
        </Text>
      }
    />
  );
}
