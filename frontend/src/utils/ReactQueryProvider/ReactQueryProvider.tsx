"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { queryClient } from "@/utils/queryClient";

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Avoid stale client on hot reload
  const [client] = useState(() => queryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
