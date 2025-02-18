import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import logger from "@/lib/logger";
export const useLogout = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return async (sessionId?: string, reason?: string) => {
    try {
      await signOut(() => {
        const searchParams = new URLSearchParams();
        if (reason) searchParams.set("reason", reason);
        
        const redirectUrl = `/sign-in${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.push(redirectUrl);
      }, sessionId ? { sessionId } : undefined);
    } catch (error) {
      logger.error("[Auth] Error signing out:", error);
      router.push("/sign-in");
    }
  };
}; 