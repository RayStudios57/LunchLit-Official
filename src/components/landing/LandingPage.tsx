import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HeartPulse,
  Dumbbell,
  Camera,
  BookOpen,
  ListChecks,
  BarChart2,
  CalendarDays,
  MessageSquare,
  Users,
  Shield,
  Trophy,
  Bot,
  Bell,
  Flame,
  Smartphone,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Award,
  GraduationCap,
  Timer,
  Droplets,
  Smile,
  FileText,
  Star,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { usePresentationMode } from '@/contexts/PresentationModeContext';

interface LandingPageProps {
  onGetStarted?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const navigate = useNavigate();
  const { enablePresentationMode } = usePresentationMode();
  const [activePreviewTab, setActivePreviewTab] = useState('bragsheet');

  const handleLaunch = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/auth');
    }
  };

  const handleLaunchDemo = () => {
    enablePresentationMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Notification Announcement */}
      <div className="w-full bg-gradient-to-r from-amber-500/15 via-primary/15 to-amber-500/15 border-b border-primary/20 py-2.5 px-4 text-center text-xs sm:text-sm font-medium">
        <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-primary/20 border-primary/40 text-primary text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5">
            🏆 Award Winner
          </Badge>
          <span className="font-semibold text-foreground">Code Your Dreams Builder / Innovator Award</span>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <span className="text-muted-foreground">Congressional App Challenge 2026 Contender</span>
          <Button
            variant="link"
            size="sm"
            onClick={handleLaunchDemo}
            className="h-auto p-0 text-xs font-semibold text-primary underline ml-1 hover:text-primary/80"
          >
            Try Live Demo →
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <ThemeLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
                LunchLit
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 uppercase tracking-widest">
                  v1.1
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1 font-medium">Student Operating System</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#showcase" className="hover:text-foreground transition-colors">Live Showcase</a>
            <a href="#awards" className="hover:text-foreground transition-colors">Awards</a>
            <a href="#bragsheet" className="hover:text-foreground transition-colors">Brag Sheet</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLaunchDemo}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            >
              Interactive Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs sm:text-sm font-medium"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={handleLaunch}
              className="text-xs sm:text-sm font-semibold shadow-md shadow-primary/20 gap-1.5"
            >
              Launch App <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-secondary/30 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/60 border border-border/80 text-foreground text-xs sm:text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Built by students, for students in grades 5 through 12</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight">
            School, wellness &amp; ambition —{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-amber-500 bg-clip-text text-transparent">
              all in one place.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop juggling 8 different apps. LunchLit brings together your classes, GPA calculator, AI study coach, daily nutrition &amp; workout hub, and college application Brag Sheet.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Button
              size="lg"
              onClick={handleLaunch}
              className="w-full sm:w-auto px-7 py-6 text-base font-semibold shadow-lg shadow-primary/25 gap-2.5"
            >
              Launch LunchLit Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-7 py-6 text-base font-semibold border-border/80 hover:bg-secondary/60 gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Try Guest Demo Mode
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 100% Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Installable Progressive Web App (PWA)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Privacy-First &amp; Ad-Free
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Common App PDF Ready
            </span>
          </div>

          {/* Social Proof & Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-border/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">54</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Badges to Unlock</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">Common App</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Brag Sheet Export</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">AI Powered</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Gym Scanner &amp; Tutor</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">Awarded</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Code Your Dreams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase Tab Section */}
      <section id="showcase" className="py-16 sm:py-24 bg-card/40 border-y border-border/50 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              Interactive Deep Dive
            </Badge>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Designed for every hour of your school day
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              See how LunchLit elevates your academics, health, and future applications.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs value={activePreviewTab} onValueChange={setActivePreviewTab} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-secondary/50 rounded-xl">
                <TabsTrigger value="bragsheet" className="py-2.5 text-xs sm:text-sm font-semibold gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Brag Sheet
                </TabsTrigger>
                <TabsTrigger value="wellness" className="py-2.5 text-xs sm:text-sm font-semibold gap-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-500" />
                  Wellness &amp; Health
                </TabsTrigger>
                <TabsTrigger value="fitness" className="py-2.5 text-xs sm:text-sm font-semibold gap-1.5">
                  <Dumbbell className="w-4 h-4 text-orange-500" />
                  AI Fitness Scanner
                </TabsTrigger>
                <TabsTrigger value="focus" className="py-2.5 text-xs sm:text-sm font-semibold gap-1.5">
                  <Timer className="w-4 h-4 text-blue-500" />
                  Focus &amp; AI Study
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Brag Sheet */}
              <TabsContent value="bragsheet" className="mt-8 animate-fade-in">
                <Card className="border-border/80 bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          <Trophy className="w-3.5 h-3.5" /> High School &amp; College Application Ready
                        </div>
                        <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                          Never scramble for recommendations or activity lists again.
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Document every project, leadership role, award, and volunteer hour in real-time. Export with one click into Common App format or a professional counselor-ready PDF.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground/90 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            Pre-formatted for Common App 10-activity lists
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            Counselor &amp; teacher PDF export with custom styles
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            Teacher verification workflows &amp; auto-calculated hours
                          </li>
                        </ul>
                        <div className="pt-2">
                          <Button onClick={handleLaunchDemo} className="gap-2">
                            Explore Brag Sheet in Demo <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Mockup Card */}
                      <div className="bg-secondary/40 border border-border/80 rounded-2xl p-5 space-y-3.5 shadow-inner">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Sample Brag Sheet Entries (2025-2026)
                          </span>
                          <Badge variant="secondary" className="text-[11px] font-mono">Verified</Badge>
                        </div>

                        {/* Entry 1 */}
                        <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-bold text-sm text-foreground">Created LunchLit</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge className="text-[10px] bg-primary/15 text-primary border-primary/20">Leadership</Badge>
                                <span className="text-xs text-muted-foreground">8th Grade • 33h</span>
                              </div>
                            </div>
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Impact: Allowed students to have a more efficient school life.
                          </p>
                        </div>

                        {/* Entry 2 */}
                        <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-bold text-sm text-foreground">Code Your Dreams Innovator Award</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge className="text-[10px] bg-amber-500/15 text-amber-500 border-amber-500/20">Award</Badge>
                                <span className="text-xs text-muted-foreground">8th Grade</span>
                              </div>
                            </div>
                            <Trophy className="w-4 h-4 text-primary shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Won for my work building the LunchLit platform.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-primary">
                            <FileText className="w-3.5 h-3.5" /> PDF Styles: Raw • Professional • Common App
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Wellness */}
              <TabsContent value="wellness" className="mt-8 animate-fade-in">
                <Card className="border-border/80 bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                          <HeartPulse className="w-3.5 h-3.5" /> Mind &amp; Body Support
                        </div>
                        <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                          School stress is real. LunchLit keeps you grounded.
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          A complete nutrition and mental wellness hub designed specifically for student schedules. Track your daily hydration, check in with mood trends, and take a 2-minute box breathing break between classes.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground/90 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            Hydration reminders &amp; monthly water intake tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            Quick 5-minute healthy snack recipes of the day
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            Interactive box-breathing reset tool for test anxiety
                          </li>
                        </ul>
                      </div>

                      <div className="bg-secondary/40 border border-border/80 rounded-2xl p-5 space-y-3 shadow-inner">
                        <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                              <Droplets className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-sm">Hydration Goal</div>
                              <div className="text-xs text-muted-foreground">5 of 8 glasses logged today</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-blue-500 font-semibold">+1 Glass</Badge>
                        </div>

                        <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Smile className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-sm">Daily Mood Check-In</div>
                              <div className="text-xs text-muted-foreground">Productive &amp; Energized</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-emerald-500 font-semibold">Logged</Badge>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card border border-border/60">
                          <div className="text-xs font-semibold text-primary mb-1">🍎 Snack of the Day</div>
                          <div className="font-bold text-sm">Apple Slices with Almond Butter &amp; Cinnamon</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Prep time: 3 mins • High protein &amp; sustained focus</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Fitness Scanner */}
              <TabsContent value="fitness" className="mt-8 animate-fade-in">
                <Card className="border-border/80 bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold">
                          <Camera className="w-3.5 h-3.5" /> AI Computer Vision
                        </div>
                        <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                          Intimidated by the school gym? Just snap a photo.
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Point your camera at any gym machine, and LunchLit's AI Gym Scanner instantly identifies the equipment, explains proper form step-by-step, and tells you which muscles it targets safely.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground/90 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                            Instant photo-based gym machine recognition
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                            Age-appropriate form and safety instructions
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                            Custom workout routine generator &amp; friend sharing
                          </li>
                        </ul>
                      </div>

                      <div className="bg-secondary/40 border border-border/80 rounded-2xl p-5 space-y-3 shadow-inner">
                        <div className="p-4 rounded-xl bg-card border border-border/60">
                          <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider mb-2">
                            <Sparkles className="w-3.5 h-3.5" /> AI Scanner Result
                          </div>
                          <div className="font-bold text-base">Lat Pulldown Machine</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Primary target: Latissimus dorsi (Back) • Secondary: Biceps
                          </div>
                          <div className="mt-3 p-2.5 rounded-lg bg-secondary/60 text-xs text-foreground/90 leading-relaxed">
                            💡 <strong>Tip:</strong> Grip wider than shoulder width. Keep your chest up and pull elbows down towards your ribs. Avoid leaning back excessively.
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 text-xs">
                          <span className="font-medium">Workout Rest Timer</span>
                          <span className="font-bold font-mono text-primary">00:45 remaining</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: Focus & Study */}
              <TabsContent value="focus" className="mt-8 animate-fade-in">
                <Card className="border-border/80 bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
                          <Bot className="w-3.5 h-3.5" /> Smart Study Tools
                        </div>
                        <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                          Crush your assignments with Pomodoro &amp; 24/7 AI tutor.
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Dial in your deep work with a built-in Pomodoro timer featuring 10 curated lofi study radio channels, live GPA predictions, and an intelligent AI study partner that guides you through tough homework concepts step-by-step.
                        </p>
                        <ul className="space-y-2 text-sm text-foreground/90 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                            Built-in Pomodoro timer with lofi study beats
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                            Live GPA calculator with weighted &amp; unweighted honors
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                            Find available quiet study halls and library spots
                          </li>
                        </ul>
                      </div>

                      <div className="bg-secondary/40 border border-border/80 rounded-2xl p-5 space-y-3 shadow-inner">
                        <div className="p-4 rounded-xl bg-card border border-border/60 text-center space-y-2">
                          <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                            Pomodoro Focus Session
                          </div>
                          <div className="font-mono text-4xl font-extrabold text-primary">25:00</div>
                          <div className="text-xs text-muted-foreground">Channel: Lofi Chill Beats (432Hz)</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                            <Bot className="w-3.5 h-3.5" /> AI Study Assistant
                          </div>
                          <p className="text-xs text-foreground/90">
                            "Break down this quadratic formula problem step-by-step using factoring..."
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Awards & Recognition Highlight Section */}
      <section id="awards" className="py-16 sm:py-24 container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary/10 to-transparent border border-primary/25 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Award className="w-4 h-4" /> Recognized For Student Impact
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground">
              Recognized by Educators &amp; Tech Competitions
            </h2>

            <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed">
              LunchLit was created to solve the real daily struggles students face with fragmented school apps, unorganized activities, and health neglect.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Code Your Dreams Builder / Innovator Award</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Awarded for excellence in student-driven software development and creating tangible educational technology.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-3">
                  <Star className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Congressional App Challenge 2026</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted as an innovative STEM submission representing students nationwide in the official U.S. House of Representatives initiative.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15 Core Features Grid */}
      <section id="features" className="py-16 sm:py-24 bg-card/30 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              Complete Feature Suite
            </Badge>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Everything students actually need in one tab
            </h2>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Say goodbye to switching between 5 disconnected websites.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: 'Brag Sheet & Common App', desc: 'Track all extracurriculars, leadership, and honors. Export directly for counselors.' },
              { icon: HeartPulse, title: 'Wellness & Nutrition Hub', desc: 'Mood check-ins, hydration streak tracking, box breathing reset, and healthy snack recipes.' },
              { icon: Camera, title: 'AI Gym Machine Scanner', desc: 'Take a photo of any exercise machine to get step-by-step form and safety tips.' },
              { icon: Bot, title: 'AI Study Companion', desc: '24/7 AI tutor explaining homework problems step-by-step without doing the work for you.' },
              { icon: BarChart2, title: 'GPA & Academic Analytics', desc: 'Live weighted and unweighted GPA calculator with grade trend projections.' },
              { icon: Timer, title: 'Pomodoro Study Timer', desc: '10 curated lofi study radio channels with adjustable intervals and background play.' },
              { icon: BookOpen, title: 'Real-Time Study Halls', desc: 'Find quiet rooms, open library tables, and study spots with live occupancy.' },
              { icon: ListChecks, title: 'Assignment & Task Tracker', desc: 'Prioritized homework tracking with due date countdowns and subject tags.' },
              { icon: CalendarDays, title: 'Class Schedule Planner', desc: 'Organize your weekly rotation, room numbers, teachers, and period times.' },
              { icon: Trophy, title: '54 Achievement Badges', desc: 'Gamified milestones across academics, wellness, fitness, and consistency.' },
              { icon: Users, title: 'Friends & Peer Cheer', desc: 'Connect with classmates, see who is studying, and cheer on their accomplishments.' },
              { icon: Flame, title: 'Daily Consistency Streaks', desc: 'Stay accountable with daily check-in streaks for study habits and hydration.' },
              { icon: MessageSquare, title: 'School Community Discussions', desc: 'Ask questions, share study tips, and join club announcement boards.' },
              { icon: Smartphone, title: 'PWA Mobile Installation', desc: 'Add directly to your iOS or Android home screen with zero app store hassle.' },
              { icon: ShieldCheck, title: 'Private & Secure', desc: 'Strict Row Level Security, private profile toggles, and total control over your data.' },
            ].map((f) => (
              <Card key={f.title} className="card-elevated hover:-translate-y-1 transition-all duration-200 border-border/70 bg-card">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 text-primary border-primary/30">Got Questions?</Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="item-1" className="border border-border/80 rounded-xl px-5 bg-card">
            <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline">
              Is LunchLit completely free?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
              Yes! LunchLit is 100% free for students, teachers, and counselors. There are no paywalls, hidden subscriptions, or invasive ads.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-border/80 rounded-xl px-5 bg-card">
            <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline">
              Can I install LunchLit on my phone like an app?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
              Yes! LunchLit is a certified Progressive Web App (PWA). On mobile Safari (iOS), tap the Share icon and select "Add to Home Screen". On Android/Chrome, tap the three dots or click the in-app "Install App" button.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-border/80 rounded-xl px-5 bg-card">
            <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline">
              How does the Brag Sheet help with high school and college applications?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
              The Brag Sheet formats your activities, volunteer hours, leadership roles, and honors into the exact structure expected by the Common App (10 activities, description, impact) and counselor recommendation questionnaires. You can download it as a print-ready PDF anytime.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border border-border/80 rounded-xl px-5 bg-card">
            <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline">
              Is my student data private?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
              Absolutely. We enforce Row Level Security (RLS) policies on the database. Your private tasks, grades, and personal notes are visible only to you. You can also toggle your profile between public and private with one click in Settings.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-24 container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-card border border-primary/30 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-foreground">
              Ready to take control of your school year?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Join students using LunchLit to streamline their classes, boost wellness, and build an unforgettable high school journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Button
                size="lg"
                onClick={handleLaunch}
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 gap-2"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-border/80"
              >
                Try Guest Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10 bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ThemeLogo size="sm" />
            <span className="font-bold text-foreground">LunchLit</span>
            <span>• Developed by Ramakrishna Krishna</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#awards" className="hover:text-foreground transition-colors">Awards</a>
            <button onClick={handleLaunchDemo} className="hover:text-foreground transition-colors">Demo Mode</button>
            <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>

          <div>
            © {new Date().getFullYear()} LunchLit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
