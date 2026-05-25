"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Camera, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AVATAR_BUCKET = "staff-avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

type StaffProfile = {
  firstName: string;
  surname: string;
  email: string;
  avatarUrl?: string;
};

function parseStaffProfile(user: User): StaffProfile {
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const nameParts = fullName ? fullName.split(/\s+/) : [];

  const firstName =
    (typeof metadata.first_name === "string" && metadata.first_name.trim()) ||
    nameParts[0] ||
    "—";
  const surname =
    (typeof metadata.last_name === "string" && metadata.last_name.trim()) ||
    nameParts.slice(1).join(" ") ||
    "—";

  return {
    firstName,
    surname,
    email: user.email ?? "—",
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined
  };
}

function getInitials(firstName: string, surname: string): string {
  const first = firstName !== "—" ? firstName.charAt(0) : "";
  const last = surname !== "—" ? surname.charAt(0) : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function AccountLogoutSection() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async () => {
      setLoadingProfile(true);

      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();

        if (error || !user) {
          setProfile(null);
          setUserId(null);
          return;
        }

        setUserId(user.id);
        setProfile(parseStaffProfile(user));
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setProfile(parseStaffProfile(session.user));
      } else {
        setUserId(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Profile picture must be 2 MB or smaller.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const objectPath = `${userId}/avatar.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(objectPath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        toast.error("Unable to upload your profile picture. Check storage setup in Supabase.");
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (updateError || !data.user) {
        toast.error("Photo uploaded but profile could not be updated. Please try again.");
        return;
      }

      setProfile(parseStaffProfile(data.user));
      toast.success("Profile picture updated");
    } catch {
      toast.error("Unable to upload your profile picture right now.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

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
      setLoggingOut(false);
    }
  };

  return (
    <Card className="space-y-6">
      <div>
        <h3 className="font-semibold">Account</h3>
        <p className="mt-1 text-sm text-foreground/65">
          Your BuddyAI staff profile and sign-out controls.
        </p>
      </div>

      {loadingProfile ? (
        <div className="flex items-center gap-2 text-sm text-foreground/65">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading account details...
        </div>
      ) : profile ? (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div
              className={cn(
                "relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted shadow-sm",
                uploadingAvatar && "opacity-70"
              )}
            >
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.surname}`}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-foreground/70">
                  {getInitials(profile.firstName, profile.surname)}
                </span>
              )}
              {uploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => void onAvatarSelect(event)}
            />

            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 text-xs"
              disabled={uploadingAvatar || loggingOut}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              {profile.avatarUrl ? "Change photo" : "Add photo"}
            </Button>
          </div>

          <dl className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Name
                </dt>
                <dd className="text-sm font-medium text-foreground">{profile.firstName}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Surname
                </dt>
                <dd className="text-sm font-medium text-foreground">{profile.surname}</dd>
              </div>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Email address
              </dt>
              <dd className="text-sm font-medium text-foreground">{profile.email}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="text-sm text-foreground/65">
          Sign in to view your account details.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-50"
        onClick={onLogout}
        disabled={loggingOut || uploadingAvatar}
      >
        {loggingOut ? (
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
