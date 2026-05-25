"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AccountLogoutSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Unable to sign out right now. Please try again.");
        return;
      }

      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Unable to sign out right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">Account</h3>
        <p className="mt-1 text-sm text-foreground/65">
          Sign out of your BuddyAI staff account on this device.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-50"
        onClick={onLogout}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </>
        )}
      </Button>
    </Card>
  );
}
