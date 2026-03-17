import type { User } from "@argusvene/contracts";
export declare function getStoredSessionUser(): User | null;
export declare function setStoredSessionUser(user: User): void;
export declare function clearStoredSessionUser(): void;
