import { Suspense, type ReactNode } from "react";
import { ToastProvider } from "@/components/toast";

/**
 * App-wide provider boundary. With Cache Components enabled, wrapping `children`
 * in Suspense lets Next split the static prerendered shell from the dynamic,
 * server-streamed page content (pages that await params/data). The ToastProvider
 * supplies a lightweight notification API to client components.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Suspense>{children}</Suspense>
    </ToastProvider>
  );
}
