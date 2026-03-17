import type { ReactNode } from "react";
interface AppShellProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
}
export declare function AppShell({ title, subtitle, actions, children }: AppShellProps): import("react/jsx-runtime").JSX.Element;
export {};
