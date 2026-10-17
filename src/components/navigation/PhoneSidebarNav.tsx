import { useState, useEffect } from 'react';
import {
  Calendar, Heart, Users, Trophy, Award, CheckSquare, Book, Target,
  BookOpen, MessageCircle, GraduationCap, UserRound,
  Settings, Gift, Bell, Power, Wifi, Copy, Check, X, Star,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';
import { useAchievements, ALL_BADGES_INCLUDING_MASTER } from '@/hooks/useAchievements';
import { friendCodeFromUserId, redeemSecretCode } from '@/lib/secrets';
import { toast } from 'sonner';
import { GoldName } from '@/components/GoldName';
import type { TabType } from '@/pages/Index';

interface PhoneSidebarNavProps {
  open: boolean;
  onClose: () => void;
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
}

const TILES: { id: TabType; label: string; icon: typeof Calendar }[] = [
  { id: 'home', label: 'Today', icon: Calendar },
  { id: 'menu', label: 'Wellness', icon: Heart },
  { id: 'discuss', label: 'Community', icon: Users },
  { id: 'bragsheet', label: 'Brag Sheet', icon: Trophy },
  { id: 'settings', label: 'Badges', icon: Award },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'classes', label: 'Classes', icon: Book },
  { id: 'portfolio', label: 'College Prep', icon: Target },
  { id: 'study', label: 'Study Hall', icon: BookOpen },
  { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  { id: 'tutor', label: 'Tutors', icon: GraduationCap },
  { id: 'profiles', label: 'Friends', icon: UserRound },
];

function StatusBar() {
  const [time, setTime] = useState('');
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const i = setInterval(tick, 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const nav: any = navigator;
    if (nav.getBattery) {
      nav.getBattery().then((b: any) => {
        const update = () => setBattery(Math.round(b.level * 100));
        update();
        b.addEventListener('levelchange', update);
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-1.5 text-[11px] font-semibold tracking-wide text-foreground/90 font-mono">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <Wifi className="w-3.5 h-3.5" />
        <span>{battery !== null ? `${battery}%` : '100%'}</span>
        <span className="inline-block w-5 h-2.5 rounded-sm border border-current relative">
          <span
            className="absolute inset-0.5 rounded-[1px] bg-current"
            style={{ width: `${Math.max(10, battery ?? 100) - 10}%` }}
          />
        </span>
      </div>
    </div>
  );
}

export function PhoneSidebarNav({ open, onClose, activeTab, onNavigate }: PhoneSidebarNavProps) {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { theme, setTheme } = useTheme();
  const { unlocked, hasMaster } = useAchievements();
  const [copied, setCopied] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');

  const friendCode = friendCodeFromUserId(user?.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    toast.success('Friend code copied!');
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRedeem = () => {
    const res = redeemSecretCode(code.trim(), profile?.full_name);
    if (res.success) {
      if (res.theme) {
        setTheme(res.theme as any);
      }
      toast.success(res.message);
      setCodeOpen(false);
      setCode('');
    } else {
      toast.error(res.message);
    }
  };

  const go = (tab: TabType) => {
    onNavigate(tab);
    onClose();
  };

  const unlockedBadges = ALL_BADGES_INCLUDING_MASTER.filter((b) => unlocked.includes(b.key));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* phone frame */}
      <div
        className="relative h-full w-[320px] max-w-[88vw] animate-fade-up bg-gradient-to-b from-card to-background border-r-2 border-foreground/20 shadow-2xl flex flex-col"
        style={{ animationDuration: '0.2s' }}
      >
        <StatusBar />

        <div className="flex flex-1 overflow-hidden">
          {/* main column */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Identity header */}
            <div className="relative m-2 mb-1 rounded-2xl bg-foreground text-background p-3 overflow-hidden">
              <button
                onClick={handleCopy}
                className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono opacity-80 hover:opacity-100"
                title="Copy your Friend Code / UID"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {friendCode}
              </button>
              <div className="flex items-center gap-3 mt-5">
                <Avatar className="w-14 h-14 ring-2 ring-background">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-display font-bold text-lg leading-tight truncate">
                    <GoldName
                      name={profile?.full_name || 'Student'}
                      email={user?.email}
                      isMaster={hasMaster}
                      showcaseBadge={profile?.showcase_badge}
                    />
                  </div>
                  <p className="text-xs opacity-80 truncate">
                    {profile?.custom_status || profile?.school_name || 'LunchLIT member'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3x4 grid */}
            <div className="grid grid-cols-3 gap-2 p-2">
              {TILES.map((tile) => {
                const Icon = tile.icon;
                const isActive = activeTab === tile.id;
                return (
                  <button
                    key={tile.id + tile.label}
                    onClick={() => go(tile.id)}
                    className={`p5-tile flex flex-col items-center justify-center gap-1.5 aspect-square p-2 font-display font-bold uppercase text-[10px] tracking-tight ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-foreground text-background'
                    }`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                    <span className="text-center leading-none">{tile.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* right utility rail */}
          <div className="w-14 shrink-0 bg-foreground text-background flex flex-col items-center py-3 gap-2">
            {/* Settings + Showcase */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background/15 transition-colors" title="Settings & Showcase">
                  <Settings className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-64">
                <p className="font-display font-semibold text-sm mb-1">Showcase Settings</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose the badge shown next to your name everywhere.
                </p>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {unlockedBadges.length === 0 && (
                    <p className="col-span-4 text-xs text-muted-foreground">No badges unlocked yet.</p>
                  )}
                  {unlockedBadges.map((b) => {
                    const sel = profile?.showcase_badge === b.key;
                    return (
                      <button
                        key={b.key}
                        onClick={() => updateProfile.mutate({ showcase_badge: sel ? null : b.key })}
                        className={`relative aspect-square rounded-lg flex items-center justify-center text-xl bg-primary/10 ring-1 ${
                          sel ? 'ring-2 ring-primary' : 'ring-primary/20'
                        }`}
                        title={b.name}
                      >
                        {sel && <Star className="absolute -top-1 -right-1 w-3 h-3 text-primary fill-primary" />}
                        {b.icon}
                      </button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => go('settings')}>
                  Open full settings
                </Button>
              </PopoverContent>
            </Popover>

            {/* Redemption code */}
            <button
              onClick={() => setCodeOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background/15 transition-colors"
              title="Redemption Code"
            >
              <Gift className="w-5 h-5" />
            </button>

            {/* Notifications / referral check */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background/15 transition-colors" title="Referrals">
                  <Bell className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-64">
                <p className="font-display font-semibold text-sm mb-1">Invite Status</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Track whether friends accepted your invite link.
                </p>
                {unlocked.includes('inviter') ? (
                  <p className="text-xs">📨 You've shared your invite — nice! We'll show accepted invites and the badges your friends unlock here.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">No invites shared yet. Share your link from the Today tab to earn the “Spread the Word” badge.</p>
                )}
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            {/* Power */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-destructive/30 transition-colors" title="Power">
                  <Power className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="left" align="end" className="w-44">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onClose}>
                  <X className="w-4 h-4 mr-2" /> Close Menu
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={() => signOut()}>
                  <Power className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Redemption code dialog (Honkai: Star Rail styled) */}
      <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Redemption Code
            </DialogTitle>
            <DialogDescription>
              Enter a code to claim hidden rewards. Case-sensitive.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code"
            className="font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          />
          <Button onClick={handleRedeem} className="w-full">Redeem</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
