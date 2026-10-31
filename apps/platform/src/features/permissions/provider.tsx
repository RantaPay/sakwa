"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { queryKeys } from "@/lib/query-keys";
import { navItemsFor, type NavItem } from "./access";
import type { PermissionRow } from "./catalog";
import { listPermissionRows, savePermission, writeGrantCookie } from "./grants";
import type { Role } from "@sakwa/types";

type PermissionContextValue = {
  rows: PermissionRow[];
  ready: boolean;
  savingId: string | null;
  error: string;
  setGrant: (role: Role, featureId: string, enabled: boolean) => void;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

function withGrant(rows: PermissionRow[], role: string, featureId: string, enabled: boolean) {
  const next = rows.filter((row) => !(row.role === role && row.feature_id === featureId));
  next.push({ role, feature_id: featureId, enabled });
  return next;
}

export function PermissionProvider({
  initial,
  children,
}: {
  initial: PermissionRow[];
  children: ReactNode;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.permissions,
    queryFn: listPermissionRows,
    initialData: initial,
  });
  const rows = query.data ?? initial;

  useEffect(() => {
    writeGrantCookie(rows);
  }, [rows]);

  const save = useMutation({
    mutationFn: savePermission,
    onMutate: async (input) => {
      await client.cancelQueries({ queryKey: queryKeys.permissions });
      const previous = client.getQueryData<PermissionRow[]>(queryKeys.permissions) ?? [];
      const next = withGrant(previous, input.role, input.featureId, input.enabled);
      client.setQueryData(queryKeys.permissions, next);
      writeGrantCookie(next);
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      client.setQueryData(queryKeys.permissions, context.previous);
      writeGrantCookie(context.previous);
    },
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.permissions });
    },
  });

  return (
    <PermissionContext.Provider
      value={{
        rows,
        ready: query.isSuccess || query.isFetched,
        savingId: save.isPending ? `${save.variables?.role}:${save.variables?.featureId}` : null,
        error: save.isError ? "Could not save that permission. Try again." : "",
        setGrant: (role, featureId, enabled) => {
          save.mutate({ role, featureId, enabled });
        },
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const value = useContext(PermissionContext);
  if (!value) throw new Error("Permissions are only available inside the dashboard.");
  return value;
}

export function useRoleNav(role: Role): NavItem[] {
  const { rows } = usePermissions();
  return navItemsFor(role, rows);
}
