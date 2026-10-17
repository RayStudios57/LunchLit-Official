import { Calendar, CheckSquare, Book, Heart, BookOpen, GraduationCap, MessageCircle, Users, Settings, Trophy, Shield, Target, Presentation, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GoldName } from '@/components/GoldName';
import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { LogOut, LogIn } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { useState, useEffect } from 'react';
import type { TabType } from '@/pages/Index';

export type NavLayout = 'tabs' | 'sidebar';

export function getNavLayout(): NavLayout {
  return (localStorage.getItem('lunchlit_nav_layout') as NavLayout) || 'tabs';
}

export function setNavLayout(layout: NavLayout) {
  localStorage.setItem('lunchlit_nav_layout', layout);
  window.dispatchEvent(new Event('nav-layout-change'));
}

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSidebar?: () => void;
}

const allTabs = [
  { id: 'home' as const, label: 'Today', icon: Calendar },
  { id: 'menu' as const, label: 'Wellness', icon: Heart },
  { id: 'classes' as const, label: 'Classes', icon: Book },
  { id: 'bragsheet' as const, label: 'Brag Sheet', icon: Trophy },
  { id: 'portfolio' as const, label: 'College Prep', icon: Target },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'discuss' as const, label: 'Community', icon: Users },
  { id: 'study' as const, label: 'Study Hall', icon: BookOpen },
  { id: 'chat' as const, label: 'AI Chat', icon: MessageCircle },
  { id: 'tutor' as const, label: 'Tutors', icon: GraduationCap },
  { id: 'profiles' as const, label: 'Friends', icon: Users },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function Header({ activeTab, onTabChange, onOpenSidebar }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRoles();
  const { isPresentationMode, togglePresentationMode, canAccessPresentationMode } = usePresentationMode();
  const [navLayout, setNavLayoutState] = useState<NavLayout>(getNavLayout());

  useEffect(() => {
    const handler = () => setNavLayoutState(getNavLayout());
    window.addEventListener('nav-layout-change', handler);
    return () => window.removeEventListener('nav-layout-change', handler);
  }, []);

  const primaryTabs = allTabs.slice(0, 5);
  const secondaryTabs = allTabs.slice(5, 11); // exclude settings

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border pt-[env(safe-area-inset-top,0px)]">
      <div className="container py-2.5 md:py-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {navLayout === 'sidebar' && (
              <Button variant="ghost" size="sm" className="p-2 min-h-[44px] min-w-[44px]" onClick={onOpenSidebar}>
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <button onClick={() => onTabChange('home')} className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity min-h-[44px]">
              <ThemeLogo size="md" />
              <div>
                <h1 className="font-display font-bold text-base sm:text-lg text-foreground leading-tight text-left">LunchLIT</h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-none">Your school companion</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user && <NotificationBell />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 min-h-[44px] px-2 sm:px-3">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm">
                      <GoldName name={profile?.full_name || 'Account'} email={user.email} showcaseBadge={profile?.showcase_badge} crownSize={14} />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onTabChange('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {canAccessPresentationMode && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={togglePresentationMode}>
                        <Presentation className="w-4 h-4 mr-2" />
                        {isPresentationMode ? '✅ Test Mode On' : 'Test Mode'}
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" className="min-h-[44px]" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation - Tab Mode (Rendered exclusively on desktop viewports >= 768px) */}
        {navLayout === 'tabs' && (
          <nav className="hidden md:flex gap-1 mt-3 bg-secondary/50 p-1 rounded-xl">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}

            {/* More dropdown for secondary tabs */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    secondaryTabs.some((t) => t.id === activeTab)
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <span className="text-lg">•••</span>
                  <span className="hidden sm:inline">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {secondaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={activeTab === tab.id ? 'bg-secondary' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}
      </div>
    </header>
  );
}
