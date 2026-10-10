import { StudyHallCard } from './StudyHallCard';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useSchoolStudyHalls } from '@/hooks/useSchoolStudyHalls';
import { DailyFocus } from '@/components/dashboard/DailyFocus';
import { InviteFriendsCard } from '@/components/dashboard/InviteFriendsCard';

interface TodayViewProps {
  onNavigateToMenu: () => void;
  onNavigateToStudy: () => void;
  onNavigate: (tab: string) => void;
}

export function TodayView({ onNavigateToStudy, onNavigate }: TodayViewProps) {
  const { studyHalls, hasStudyHalls } = useSchoolStudyHalls();
  const availableHalls = studyHalls.filter((h) => h.is_available).slice(0, 2);

  return (
    <div className="space-y-8 pb-8">
      <section className="opacity-0 animate-fade-up stagger-1">
        <DailyFocus />
      </section>

      <section className="opacity-0 animate-fade-up stagger-2">
        <InviteFriendsCard />
      </section>

      {/* Student Quick Action Hub - LunchLit 1.2 UX update */}
      <section className="opacity-0 animate-fade-up stagger-3">
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-display font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Student Quick Actions
            </h3>
            <span className="text-xs text-muted-foreground">LunchLit 1.2</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onNavigate('bragsheet')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <span className="text-base">🏆</span>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Brag Sheet</div>
                <div className="text-[11px] text-muted-foreground">Log win / awards</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <span className="text-base">🤖</span>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">AI Study Tutor</div>
                <div className="text-[11px] text-muted-foreground">Instant homework help</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('classes')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <span className="text-base">📅</span>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Class Schedule</div>
                <div className="text-[11px] text-muted-foreground">Periods &amp; rooms</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <span className="text-base">🌱</span>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Wellness &amp; Gym</div>
                <div className="text-[11px] text-muted-foreground">AI machine scanner</div>
              </div>
            </button>
          </div>
        </div>
      </section>



      {/* Available Study Halls - Only show if school has study halls */}
      {hasStudyHalls && availableHalls.length > 0 && (
        <section className="opacity-0 animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Open Study Halls</h2>
            </div>
            <button 
              onClick={onNavigateToStudy}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              See all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {availableHalls.map((hall, index) => (
              <StudyHallCard key={hall.id} hall={hall} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
