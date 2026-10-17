import { useState } from 'react';
import {
  Calendar,
  Heart,
  Book,
  CheckSquare,
  LayoutGrid,
  Trophy,
  Target,
  Users,
  BookOpen,
  MessageCircle,
  GraduationCap,
  Award,
  Settings,
  Info,
  Flame,
  ChevronRight,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GoldName } from '@/components/GoldName';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAchievements } from '@/hooks/useAchievements';
import { Link } from 'react-router-dom';
import type { TabType } from '@/pages/Index';

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: typeof Calendar;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Today', icon: Calendar },
  { id: 'menu', label: 'Wellness', icon: Heart },
  { id: 'classes', label: 'Classes', icon: Book },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

const MORE_TOOLS: { id: TabType; label: string; desc: string; icon: typeof Calendar; color: string }[] = [
  { id: 'bragsheet', label: 'Brag Sheet', desc: 'College activity tracker', icon: Trophy, color: 'text-amber-500 bg-amber-500/10' },
  { id: 'portfolio', label: 'College Prep', desc: 'Target colleges & scholarships', icon: Target, color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'discuss', label: 'Community', desc: 'Student discussions & Q&A', icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'profiles', label: 'Friends', desc: 'Cheer on classmates', icon: Users, color: 'text-sky-500 bg-sky-500/10' },
  { id: 'study', label: 'Study Hall', desc: 'Find open study spots', icon: BookOpen, color: 'text-teal-500 bg-teal-500/10' },
  { id: 'chat', label: 'AI Study Chat', desc: 'Instant homework assistance', icon: MessageCircle, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'tutor', label: 'Tutors', desc: 'Online & school peer tutors', icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'settings', label: 'Badges & Stats', desc: '54 badges & achievements', icon: Award, color: 'text-yellow-500 bg-yellow-500/10' },
  { id: 'settings', label: 'Settings', desc: 'Theme, profile & account', icon: Settings, color: 'text-neutral-500 bg-neutral-500/10' },
];

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRoles();
  const { unlocked } = useAchievements();
  const taskStreak = parseInt(localStorage.getItem('lunchlit_task_streak') || '0', 10);

  // Check if active tab belongs to the "More" tools
  const isMoreActive = !PRIMARY_NAV_ITEMS.some((item) => item.id === activeTab);
  const currentMoreItem = MORE_TOOLS.find((t) => t.id === activeTab);

  const handleSelectTab = (tab: TabType) => {
    onTabChange(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar: visible strictly on viewports < 768px */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/92 backdrop-blur-xl border-t border-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),10px)] select-none"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-primary/15 scale-105' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th "More" / Drawer Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all duration-150 active:scale-95 ${
              isMoreActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                isMoreActive ? 'bg-primary/15 scale-105' : 'bg-transparent'
              }`}
            >
              <LayoutGrid className={`w-5 h-5 transition-transform ${isMoreActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {isMoreActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${isMoreActive ? 'font-bold text-primary' : 'font-medium'}`}>
              {isMoreActive && currentMoreItem ? currentMoreItem.label : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Modern Touch-First Bottom Sheet Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl p-0 max-h-[85vh] overflow-hidden flex flex-col md:hidden"
        >
          {/* Grab Handle */}
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto my-3 shrink-0" />

          {/* User Status Bar in Drawer */}
          <div className="px-5 pb-3 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'L'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <GoldName
                    name={profile?.full_name || 'LunchLit Student'}
                    email={user?.email}
                    showcaseBadge={profile?.showcase_badge}
                    crownSize={14}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{profile?.grade_level ? `${profile.grade_level}th Grade` : 'Student'}</span>
                  {taskStreak > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {taskStreak}d streak
                    </span>
                  ) : unlocked && unlocked.size > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-primary font-semibold">
                      <Award className="w-3 h-3" />
                      {unlocked.size} badges
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Link
              to="/about"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary"
            >
              <Info className="w-3.5 h-3.5" />
              v1.2
            </Link>
          </div>

          <SheetHeader className="px-5 pt-3 pb-1 text-left">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              All Features & Tools
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Tap any category to switch views instantly
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable Tool Grid */}
          <div className="px-4 py-2 overflow-y-auto space-y-2 flex-1 pb-[max(env(safe-area-inset-bottom,0px),24px)]">
            <div className="grid grid-cols-2 gap-2.5">
              {MORE_TOOLS.map((tool, idx) => {
                const Icon = tool.icon;
                const isCurrent = activeTab === tool.id;

                return (
                  <button
                    key={`${tool.id}-${idx}`}
                    type="button"
                    onClick={() => handleSelectTab(tool.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition-all active:scale-98 ${
                      isCurrent
                        ? 'bg-primary/10 border-primary text-primary font-semibold shadow-sm'
                        : 'bg-card/70 border-border/70 hover:bg-accent/40 text-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${tool.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{tool.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Links Row */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/60 mt-3">
              <Link
                to="/about"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-colors"
              >
                <Info className="w-4 h-4 text-primary" />
                About LunchLit
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-colors"
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
