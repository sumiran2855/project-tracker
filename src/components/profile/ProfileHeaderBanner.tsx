import { Briefcase, MapPin, Shield, Calendar, Sliders } from 'lucide-react';
import type { UserProfile } from '@/services/useProfileService';

interface ProfileHeaderBannerProps {
  profile: UserProfile;
  initials: string;
  onEditClick: () => void;
}

export function ProfileHeaderBanner({
  profile,
  initials,
  onEditClick,
}: ProfileHeaderBannerProps) {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-650 to-violet-650 p-6 sm:p-8 text-white overflow-hidden shadow-md">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 left-10 h-32 w-32 bg-indigo-400/20 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Avatar circle */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-3xl font-black tracking-tight text-white shadow-inner">
            {initials}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-black tracking-tight">{profile.name}</h1>
            <p className="text-sm font-semibold text-indigo-100 flex items-center justify-center sm:justify-start gap-1.5">
              <Briefcase className="h-4 w-4 shrink-0" />
              {profile.role}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-white/80">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {profile.department}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Member since {profile.joinDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4.5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-800/10 shrink-0"
        >
          <Sliders className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}
