import { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Clock, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Floating academic & focus symbols falling continuously across the banner
const FOCUS_ITEMS = ['⚡', '📚', '⏱️', '🎯', '✨', '📝', '🎓', '🔥', '💡', '⏰', '📖', '🌟', '🏆', '🚀', '🧠', '✏️'];

interface LunchLitV12BannerProps {
  onNavigate?: (tab: string) => void;
}

export function LunchLitV12Banner({ onNavigate }: LunchLitV12BannerProps) {
  const [visible, setVisible] = useState(false);
  const [floaters, setFloaters] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    emoji: string;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const dismissed = localStorage.getItem('lunchlit_v12_banner_dismissed');
    if (!dismissed) setVisible(true);

    // Generate falling academic & productivity floaters
    setFloaters(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 96 + 2, // 2% to 98%
        delay: Math.random() * 4,
        emoji: FOCUS_ITEMS[Math.floor(Math.random() * FOCUS_ITEMS.length)],
        duration: 4.5 + Math.random() * 4,
        size: 16 + Math.random() * 14,
      }))
    );
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('lunchlit_v12_banner_dismissed', 'true');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-amber-500/10 to-indigo-500/15 p-5 sm:p-6 mb-2 shadow-lg backdrop-blur-sm">
      {/* Background Animated Floating Emojis */}
      {floaters.map((f) => (
        <span
          key={f.id}
          className="absolute pointer-events-none select-none animate-[confetti-fall_var(--d)_linear_infinite]"
          style={{
            left: `${f.left}%`,
            top: '-15%',
            fontSize: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            opacity: 0.85,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            ...({ '--d': `${f.duration}s` } as React.CSSProperties),
          }}
        >
          {f.emoji}
        </span>
      ))}

      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2.5 right-2.5 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-card/60 rounded-full z-10 transition-colors"
        onClick={dismiss}
        title="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Banner Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        {/* Version Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
          <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>Major Update Released</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-foreground">v1.2</span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-6 w-6 text-amber-500 animate-bounce hidden sm:inline-block" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display bg-gradient-to-r from-primary via-amber-500 to-indigo-400 bg-clip-text text-transparent">
            LunchLit v1.2 — Student Focus &amp; Schedule Overhaul
          </h2>
          <Zap className="h-6 w-6 text-primary animate-bounce style-delay-200 hidden sm:inline-block" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Crafted for high school &amp; middle school flow: dynamic period bell countdowns, rotation schedule support, passing period transitions, integrated Pomodoro study hub, 48h test radar, and counselor-ready Brag Sheet PDF export. ⚡📚
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 max-w-3xl">
          <Badge variant="secondary" className="text-[11px] font-semibold bg-card/80 border border-border/80 text-foreground py-1 px-2.5 flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-primary" /> Live Bell &amp; Period Countdown
          </Badge>
          <Badge variant="secondary" className="text-[11px] font-semibold bg-card/80 border border-border/80 text-foreground py-1 px-2.5 flex items-center gap-1 shadow-sm">
            <Calendar className="w-3 h-3 text-amber-500" /> Rotation Days &amp; Passing Periods
          </Badge>
          <Badge variant="secondary" className="text-[11px] font-semibold bg-card/80 border border-border/80 text-foreground py-1 px-2.5 flex items-center gap-1 shadow-sm">
            <span>🍅</span> Pomodoro Study Bar + Lofi
          </Badge>
          <Badge variant="secondary" className="text-[11px] font-semibold bg-card/80 border border-border/80 text-foreground py-1 px-2.5 flex items-center gap-1 shadow-sm">
            <Trophy className="w-3 h-3 text-amber-500" /> 1-Tap Daily Win Capture
          </Badge>
          <Badge variant="secondary" className="text-[11px] font-semibold bg-card/80 border border-border/80 text-foreground py-1 px-2.5 flex items-center gap-1 shadow-sm">
            <span>📄</span> Flawless Brag Sheet PDF
          </Badge>
        </div>

        {/* Quick Action Navigation */}
        {onNavigate && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="default"
              className="text-xs font-bold gap-1.5 h-8 px-3 rounded-lg shadow-md"
              onClick={() => onNavigate('classes')}
            >
              Explore Classes &amp; Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-medium h-8 px-3 rounded-lg bg-card/60 hover:bg-card"
              onClick={() => onNavigate('bragsheet')}
            >
              View Brag Sheet &amp; PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
