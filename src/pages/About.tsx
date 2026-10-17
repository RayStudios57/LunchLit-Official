import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Shield, Users, BookOpen, Calendar, MessageSquare, ClipboardList, GraduationCap, Bell, Palette, History, ShieldBan, BarChart3, Flame, Award, Smartphone, Heart, Dumbbell, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreatorSocialLinks } from '@/components/about/CreatorSocialLinks';
import { SuggestionsSection } from '@/components/about/SuggestionsSection';
import { Separator } from '@/components/ui/separator';

const CURRENT_VERSION = '1.2';

const changelogData = [
  {
    version: '1.2',
    date: 'October 2026',
    changes: [
      '🚀 Major Today Screen Overhaul: Dynamic hero section with real-time class tracking, live bell countdown, and "Up Next" preview guidance',
      '📱 Touch-First Mobile Experience — brand-new mobile bottom navigation bar & compact mobile header',
      '🔗 Unified Action Hub: Merged Today\'s #1 Focus with an interactive task checklist and 48-hour exam radar',
      '⏱️ Elevated Pomodoro Study Bar: Quick-launch timers with subject tagging and integrated lofi music streams',
      '🏆 Brag Sheet Quick-Capture: One-tap "+ Log Daily Win" modal to instantly record achievements on the fly',
      '🏫 Advanced Classes & Schedule Management: Native support for Lunch Blocks, Passing/Advisory Periods, and Extracurricular Clubs',
      '🔄 Rotation Schedules: Seamless toggle support for Gold/Blue days and alternative block schedules',
      '📊 Smart GPA & Sync Fixes: Resolved OCR grade scanning Edge Function errors with graceful manual fallbacks and fixed cross-tab data sync for College Prep & Brag Sheet',
      '📦 Android APK / AAB build support with Capacitor & enhanced PWA configuration',
      '🎯 Safe area inset padding for notch and edge-to-edge mobile navigation',
      '🔒 Google Play Compliance: Official Privacy Policy with dedicated URL and account deletion guidance',
    ],
  },
  {
    version: '1.1',
    date: 'May 2026',
    changes: [
      '🌱 New Wellness tab (renamed from Menu) with Nutrition & Fitness subtabs',
      '🍎 Easy Snack of the Day — quick, healthy, tasty snacks with prep time',
      '💪 Fitness Hub: set your age, goal, and days/week to get tailored recommendations',
      '📸 Gym Machine Scanner — snap a photo and AI walks you through how to use it safely',
      '🏋️ Build & save custom gym routines right in the app',
      '🤝 Share gym routines with friends — they show up in their Fitness tab',
      '✨ AI "build me a routine" — generate a tailored workout from your goal, age & equipment',
      '⏱️ Built-in rest timer between sets (30/60/90/120s)',
      '🔥 Workout logging with daily streaks + 6 new Fitness badges',
      '📊 Wellness dashboard: mood trend, hydration charts, and monthly water totals',
      '💧 Periodic hydration reminders to keep you drinking water',
      '🧘 Mood check-ins, hydration tracker, and box-breathing reset on the Nutrition tab',
      '🏫 School selection now includes Generic Middle School, Generic High School, and No School',
      '💬 Real student names + clickable profiles in the Community tab (public profiles)',
      '4 new anonymous question prompts seeded into Community to spark conversation',
      '🔒 Privacy upgrades: private profiles hidden from search/directory, Public/Private badge with tooltips, confirmation when switching to private',
      '👑 Owner account permanently protected as admin',
      'Profiles now default to public — opt in to private from Settings',
    ],
  },
  {
    version: '1.0',
    date: 'March 2026',
    changes: [
      '🎉 LunchLit is officially released — v1.0!',
      '📸 Scan grades from a photo — AI auto-fills the GPA calculator',
      '🎓 Portfolio renamed to "College Prep" with new live Scholarships finder (powered by web research)',
      'GPA calculator moved into the Classes tab where it belongs',
      'Today tab cleaned up — fake menu removed, "today\'s menu" header now sits right under Today at a Glance',
      'Stay-signed-in: log in once, stay logged in across visits',
      'Google sign-in button now always shows the account picker',
      'Service worker hardened to fix the LunchLit-won\'t-open issue on MacBooks (auto-recovers + ?reset=sw escape hatch)',
      '8th grade option added to Brag Sheet entries',
      'Configurable end-of-school date per student with accurate countdown',
      'Summer Break theme that auto-activates when school ends',
      'Theme background customization — use themed backgrounds per color scheme',
      'Friends system — send friend requests, cheer on friends, search by user ID',
      'Friend presence — green/yellow/grey dots, "in Brag Sheet"-style activity, last-seen, custom statuses',
      'Profiles tab renamed to Friends with full social features',
      'Fixed signup error preventing new account creation',
      'Hardened security: private brag-sheet uploads with signed URLs, server-side achievement awarding, RLS lock-downs',
      'Stable, polished, and ready for students everywhere',
    ],
  },
  {
    version: '0.9',
    date: 'March 2026',
    changes: [
      'Installable PWA with in-app install button — add LunchLit to phone or desktop',
      'Study Stats dashboard with weekly productivity, daily streak tracker, and bar chart',
      'Daily streak counter tracking consecutive days with completed tasks',
      'GPA Calculator widget on the Today dashboard',
      'Built-in Pomodoro study timer with 10 peaceful lofi music channels and volume control',
      'Expanded to 48 achievement badges across 15 categories including Menu, Study Halls, Planner, Discussion, Portfolio, Profile, Pomodoro, and Tutoring',
      'Special "LunchLit Master" badge for completing all achievements',
      'Public student profiles — browse other students\' badges and achievements',
      'Profile visibility toggle in Settings (owner profile always public)',
      'Database-backed tutor system — add school-specific or online tutors for anyone',
      'Redesigned Badges page with 15 category sections, progress tracking, and hover details',
      'Weekly Inspirational Quotes (52+ quotes, rotates each week)',
      'Redesigned About page with cleaner structure and latest-first changelog',
      'Redesigned Settings page with organized layout',
      'Updated onboarding tutorial covering all new features',
    ],
  },
  {
    version: '0.8',
    date: 'February 2026',
    changes: [
      'Interactive 11-step onboarding tutorial for new users',
      'Replay tutorial anytime from Settings',
      'Admin feedback management with email notifications',
      'Admin account deletion and request management',
      'Admin user activity tracking',
    ],
  },
  {
    version: '0.7',
    date: 'February 2026',
    changes: ['We finally figured out how to add Google authentication, Yippee :)'],
  },
  {
    version: '0.6',
    date: 'February 2026',
    changes: [
      'Fancy PDF export with embedded images and visual styling',
      'Common App format PDF export matching college application layouts',
      'Drag-and-drop activity reordering for Brag Sheet priorities',
      'Admin-only Presentation Mode with dummy data for demos',
      'Student Portfolio with goals, target schools, and college predictor',
    ],
  },
  {
    version: '0.5',
    date: 'January 2026',
    changes: [
      'Real-time Brag Sheet system for tracking achievements',
      'Grade level progression with historical records',
      'Academics section with GPA, test scores, and courses',
      'PDF export for Brag Sheet with full profile',
      'Meal preview and MealViewer import for admins',
    ],
  },
  {
    version: '0.4',
    date: 'December 2025',
    changes: [
      'Manual Brag Sheet entry management with structured fields',
      'Auto-suggested entries based on completed tasks',
      'Updated grade level selection (5th-12th grade)',
    ],
  },
  {
    version: '0.3',
    date: 'December 2025',
    changes: [
      'Theme customization with multiple light/dark themes',
      'Theme-aware app logos',
      'Dedicated Tasks / To-Do tab',
      'Centralized Settings page',
      'Google Calendar export and syncing',
    ],
  },
  {
    version: '0.2',
    date: 'December 2025',
    changes: [
      'Today dashboard widget with upcoming classes/tasks',
      'Import/export for schedules and tasks (CSV/JSON)',
      'Grade level selection during onboarding',
      'Discussion/community tab for communication',
    ],
  },
  {
    version: '0.1',
    date: 'December 2025',
    changes: [
      'Core student dashboard',
      'Class schedule viewer',
      'School meal display',
      'Basic task and planning functionality',
      'Study halls and open periods finder',
    ],
  },
];

const features = [
  { icon: Heart, label: 'Wellness Hub', desc: 'Mood, hydration, breathing, and easy snacks of the day' },
  { icon: Dumbbell, label: 'Fitness Tools', desc: 'Goal-based recommendations and custom gym routines' },
  { icon: Camera, label: 'Machine Scanner', desc: 'AI explains how to use any gym machine from a photo' },
  { icon: BookOpen, label: 'Study Halls', desc: 'Find available study spots in real-time' },
  { icon: ClipboardList, label: 'Task Tracking', desc: 'Manage assignments with due dates and priorities' },
  { icon: Calendar, label: 'Class Schedule', desc: 'Track daily classes with room numbers and times' },
  { icon: BarChart3, label: 'Study Stats', desc: 'Productivity trends, streaks, and weekly progress' },
  { icon: MessageSquare, label: 'AI Study Chat', desc: 'Get homework help from an AI tutor' },
  { icon: Users, label: 'Discussions', desc: 'Connect with your school community' },
  { icon: Shield, label: 'Brag Sheet', desc: 'Build your college application profile' },
  { icon: Award, label: '54 Badges', desc: 'Unlock achievements across 16 categories' },
  { icon: Users, label: 'Friends', desc: 'Connect with classmates, cheer them on' },
  { icon: Bell, label: 'Notifications', desc: 'Task reminders and announcements' },
  { icon: Flame, label: 'Streak Tracker', desc: 'Track daily consistency' },
  { icon: Smartphone, label: 'PWA Install', desc: 'Add to your phone home screen' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About LunchLit - Your Daily School Companion</title>
        <meta name="description" content="Learn about LunchLit, the comprehensive school companion app designed to help students manage their daily school life." />
      </Helmet>

      <div className="container py-8 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Version 1.2
          </h1>
          <p className="text-muted-foreground text-lg">Your daily school companion</p>
          <p className="text-sm text-muted-foreground">
            <strong>LIT</strong> = <strong>L</strong>earning, <strong>I</strong>nsight, <strong>T</strong>racking
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Code className="h-3.5 w-3.5" />
            Version {CURRENT_VERSION}
          </div>
        </div>

        {/* Mission */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>LunchLIT is a comprehensive school companion app designed to help students manage their daily school life — from organizing class schedules and tracking assignments, to finding study halls, building college brag sheets, and staying healthy with nutrition and fitness tools.</p>
            <p>Built by a student, for students — LunchLit understands the challenges of staying organized, eating well, and staying active during a busy school year. We're here to make your academic journey smoother, healthier, and more enjoyable.</p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((f, i) =>
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40">
                  <f.icon className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Changelog - most recent first, latest open by default */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              What's New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue={changelogData[0].version} className="w-full">
              {changelogData.map((release) =>
                <AccordionItem key={release.version} value={release.version}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        v{release.version}
                      </span>
                      <span className="text-sm text-muted-foreground">{release.date}</span>
                      {release.version === CURRENT_VERSION &&
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary text-primary-foreground">LATEST</span>
                      }
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5 pl-1">
                      {release.changes.map((change, idx) =>
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {change}
                        </li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>

        {/* Personalization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" />
              Personalization
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>Make LunchLIT yours with multiple color themes including Ocean, Forest, Sunset, Midnight, and Lavender. Each theme provides a comfortable viewing experience while maintaining accessibility.</p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldBan className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>Your data belongs to you. LunchLIT uses secure authentication and follows best practices for data protection. We never share your personal information with third parties, and you can delete your account at any time.</p>
            <div className="pt-1">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/privacy">
                  <Shield className="w-4 h-4 text-primary" />
                  Read Full Privacy Policy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <SuggestionsSection />

        {/* Creator */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Created by</p>
              <div className="space-y-1">
                <p className="font-display text-xl font-semibold text-foreground">Ramakrishna Krishna the GOAT</p>
              </div>
              <CreatorSocialLinks />
              <Separator className="my-3" />
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <Link to="/privacy" className="hover:underline hover:text-foreground">
                  Privacy Policy
                </Link>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Code className="h-3.5 w-3.5" />
                  <span>LunchLit © {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pb-4">
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
