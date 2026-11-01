import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Search, 
  ExternalLink, 
  Calendar, 
  Award, 
  Bookmark, 
  BookmarkCheck, 
  Users, 
  User, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Filter,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { useTasks } from '@/hooks/useTasks';

export interface Competition {
  id: string;
  title: string;
  organizer: string;
  category: 'stem' | 'coding' | 'math' | 'business' | 'writing' | 'robotics' | 'debate';
  format: 'individual' | 'team' | 'both';
  tier: 'Premier / Tier 1' | 'National' | 'International';
  prizes: string;
  deadline: string;
  gradeLevel: string;
  description: string;
  url: string;
  tags: string[];
}

export const HIGH_SCHOOL_COMPETITIONS: Competition[] = [
  {
    id: 'regeneron-sts',
    title: 'Regeneron Science Talent Search (STS)',
    organizer: 'Society for Science',
    category: 'stem',
    format: 'individual',
    tier: 'Premier / Tier 1',
    prizes: '$3.1M+ total awards ($250,000 first prize)',
    deadline: 'Early November annually',
    gradeLevel: 'High School Seniors (12th grade)',
    description: 'The nation’s oldest and most prestigious science and math competition for high school seniors. Submit an original scientific research project and paper.',
    url: 'https://www.societyforscience.org/regeneron-sts/',
    tags: ['Research Paper', 'STEM', '$250k Top Prize', 'Ivy League Distinguish'],
  },
  {
    id: 'regeneron-isef',
    title: 'Regeneron International Science and Engineering Fair (ISEF)',
    organizer: 'Society for Science',
    category: 'stem',
    format: 'both',
    tier: 'Premier / Tier 1',
    prizes: '$9M+ in total scholarships & cash awards',
    deadline: 'Spring (Qualify through regional/state affiliated science fairs)',
    gradeLevel: 'Grades 9 - 12',
    description: 'The world’s largest pre-college STEM competition. Nearly 1,800 students from more than 75 countries present independent STEM research projects to doctoral-level judges.',
    url: 'https://www.societyforscience.org/isef/',
    tags: ['Global', 'Engineering', 'Science Fair', 'Grand Awards'],
  },
  {
    id: 'usaco',
    title: 'USA Computing Olympiad (USACO)',
    organizer: 'USACO',
    category: 'coding',
    format: 'individual',
    tier: 'Premier / Tier 1',
    prizes: 'National Team Finalist & International Olympiad in Informatics (IOI)',
    deadline: 'Contests monthly (Dec, Jan, Feb, US Open in March)',
    gradeLevel: 'Middle & High School (Free)',
    description: 'The premier algorithmic programming competition for high school students in the United States. Solve algorithmic challenge problems in C++, Java, or Python across Bronze, Silver, Gold, and Platinum divisions.',
    url: 'http://www.usaco.org/',
    tags: ['Algorithms', 'C++', 'Java', 'Python', 'Free', 'Competitive Programming'],
  },
  {
    id: 'amc-math',
    title: 'American Mathematics Competitions (AMC 10 / 12)',
    organizer: 'Mathematical Association of America (MAA)',
    category: 'math',
    format: 'individual',
    tier: 'Premier / Tier 1',
    prizes: 'Qualification for AIME, USA(J)MO, and MOP (Math Olympiad Program)',
    deadline: 'November annually (AMC 10/12 A & B dates)',
    gradeLevel: 'AMC 10 (Grades 10 & below), AMC 12 (Grades 12 & below)',
    description: 'The leading high school math competition in America. 25 multiple-choice questions in 75 minutes testing creative mathematical problem solving and logic beyond routine school math.',
    url: 'https://maa.org/math-competitions/amc-1012',
    tags: ['Mathematics', 'Olympiad Qualifier', 'Problem Solving', 'AIME'],
  },
  {
    id: 'congressional-app',
    title: 'Congressional App Challenge',
    organizer: 'U.S. House of Representatives & Internet Education Foundation',
    category: 'coding',
    format: 'both',
    tier: 'National',
    prizes: 'Capitol Hill exhibition, congressional recognition, national press',
    deadline: 'October 24 annually',
    gradeLevel: 'Middle and High School students in participating congressional districts',
    description: 'Official coding challenge hosted by Members of Congress. Design and program a functional application (web, mobile, game, robotics) in any programming language for your community.',
    url: 'https://www.congressionalappchallenge.us/',
    tags: ['App Dev', 'Web Dev', 'Civic Tech', 'Congress Recognition', 'Free'],
  },
  {
    id: 'scholastic-art-writing',
    title: 'Scholastic Art & Writing Awards',
    organizer: 'Alliance for Young Artists & Writers',
    category: 'writing',
    format: 'individual',
    tier: 'National',
    prizes: 'National Gold Medals, Carnegie Hall ceremony, $12,000+ scholarships',
    deadline: 'December - January (by regional affiliate)',
    gradeLevel: 'Grades 7 - 12 (Ages 13+)',
    description: 'The nation’s most prestigious creative recognition program for teens. Categories include Poetry, Short Story, Personal Essay/Memoir, Journalism, Novel Writing, Painting, Photography, and Architecture.',
    url: 'https://www.artandwriting.org/',
    tags: ['Creative Writing', 'Poetry', 'Journalism', 'Visual Arts', 'Gold Key'],
  },
  {
    id: 'diamond-challenge',
    title: 'Diamond Challenge for High School Entrepreneurs',
    organizer: 'University of Delaware Horn Entrepreneurship',
    category: 'business',
    format: 'team',
    tier: 'International',
    prizes: '$100,000+ prize pool for startup seed funding',
    deadline: 'Mid-January annually',
    gradeLevel: 'High school students ages 14-18',
    description: 'Top global entrepreneurship competition for teens. Pitch an innovative business idea in the Business Innovation Track or Social Innovation Track to venture capitalists and startup leaders.',
    url: 'https://diamondchallenge.org/',
    tags: ['Entrepreneurship', 'Pitch Deck', 'Startup', '$100k Prize', 'Venture'],
  },
  {
    id: 'national-history-day',
    title: 'National History Day (NHD) Contest',
    organizer: 'National History Day, Inc.',
    category: 'writing',
    format: 'both',
    tier: 'National',
    prizes: 'Cash awards, national medals, and university scholarships',
    deadline: 'Regional competitions in Feb/March -> Nationals in June',
    gradeLevel: 'Junior Division (Grades 6-8), Senior Division (Grades 9-12)',
    description: 'Conduct extensive primary and secondary historical research based on an annual theme and produce an original Documentary, Exhibit, Paper, Performance, or Website.',
    url: 'https://www.nhd.org/',
    tags: ['History', 'Primary Sources', 'Documentary', 'Website', 'College Prep'],
  },
  {
    id: 'conrad-challenge',
    title: 'The Conrad Challenge',
    organizer: 'The Conrad Foundation',
    category: 'stem',
    format: 'team',
    tier: 'International',
    prizes: 'Pete Conrad Scholars, NASA Kennedy Space Center Summit, IP support',
    deadline: 'November annually',
    gradeLevel: 'Ages 13 - 18 (Teams of 2-5)',
    description: 'Global innovation competition where student teams design commercially viable technological solutions in Aerospace, Cyber-Technology, Energy & Environment, or Health & Nutrition.',
    url: 'https://www.conradchallenge.org/',
    tags: ['Aerospace', 'Innovation', 'Clean Energy', 'NASA Summit', 'Teamwork'],
  },
  {
    id: 'deca-competitive',
    title: 'DECA Competitive Events Series',
    organizer: 'DECA Inc.',
    category: 'business',
    format: 'both',
    tier: 'International',
    prizes: 'DECA Glass trophies, international recognition, corporate scholarships',
    deadline: 'State CDC (Feb/March) -> International CDC (ICDC in April)',
    gradeLevel: 'High school students in active DECA chapters',
    description: 'Compete in business roleplays, case studies, finance exams, and marketing project presentations evaluated by real-world corporate executives and entrepreneurs.',
    url: 'https://www.deca.org/high-school-programs/high-school-competitive-events/',
    tags: ['Business', 'Marketing', 'Finance', 'ICDC', 'Public Speaking'],
  },
  {
    id: 'fbla-competitions',
    title: 'FBLA National Leadership Competitive Events',
    organizer: 'Future Business Leaders of America (FBLA)',
    category: 'business',
    format: 'both',
    tier: 'National',
    prizes: 'National awards, cash trophies, corporate sponsor scholarships',
    deadline: 'Spring State Conferences -> NLC in June/July',
    gradeLevel: 'Grades 9 - 12',
    description: 'Over 70 competitive events covering accounting, business law, coding, cybersecurity, graphic design, social media strategies, and public speaking.',
    url: 'https://www.fbla-pbl.org/divisions/fbla/fbla-competitive-events/',
    tags: ['Leadership', 'Business Law', 'Coding', 'Finance', 'State & National'],
  },
  {
    id: 'first-robotics-frc',
    title: 'FIRST Robotics Competition (FRC)',
    organizer: 'FIRST Inspires',
    category: 'robotics',
    format: 'team',
    tier: 'International',
    prizes: '$80M+ in college scholarships available to FIRST participants',
    deadline: 'Kickoff in January -> Regional Tournaments Feb-April',
    gradeLevel: 'Grades 9 - 12',
    description: 'Industrial-strength robotics competition known as the "Varsity Sport for the Mind". Teams build 125-pound robots under strict rules to compete in fast-paced alliance tournaments.',
    url: 'https://www.firstinspires.org/robotics/frc',
    tags: ['Robotics', 'Java/C++', 'Pneumatics', 'CAD', '$80M Scholarships'],
  },
  {
    id: 'technovation-girls',
    title: 'Technovation Girls Global Competition',
    organizer: 'Technovation',
    category: 'coding',
    format: 'team',
    tier: 'International',
    prizes: 'All-expenses-paid World Summit in Silicon Valley, cash educational stipends',
    deadline: 'March - April annually',
    gradeLevel: 'Girls and non-binary students ages 8 - 18',
    description: 'Learn to code a mobile app and create a business plan that addresses a problem in your community aligned with the UN Sustainable Development Goals.',
    url: 'https://technovationchallenge.org/',
    tags: ['Girls in Tech', 'Mobile App', 'Silicon Valley', 'Social Good', 'Free'],
  },
  {
    id: 'nsda-speech-debate',
    title: 'NSDA National Speech & Debate Tournament',
    organizer: 'National Speech & Debate Association',
    category: 'debate',
    format: 'both',
    tier: 'National',
    prizes: 'National champion titles, college scholarships, national Hall of Fame',
    deadline: 'District qualifiers Feb - April -> Nationals in June',
    gradeLevel: 'Grades 9 - 12',
    description: 'The world’s largest academic tournament. Compete in Policy Debate, Public Forum, Lincoln-Douglas, Congressional Debate, Extemporaneous Speaking, and Original Oratory.',
    url: 'https://www.speechanddebate.org/nationals/',
    tags: ['Debate', 'Public Speaking', 'Policy', 'Advocacy', 'Ivy League Standout'],
  },
  {
    id: 'biogeneius-challenge',
    title: 'International BioGENEius Challenge',
    organizer: 'Biotechnology Institute',
    category: 'stem',
    format: 'individual',
    tier: 'International',
    prizes: 'Cash awards and presentation at the annual BIO International Convention',
    deadline: 'Spring annually',
    gradeLevel: 'High school students with biotechnology projects',
    description: 'Showcase original research in healthcare biotechnology, agricultural sustainability, or industrial and environmental biotech to industry leaders.',
    url: 'https://www.biotechinstitute.org/biogeneius/',
    tags: ['Biotech', 'Genomics', 'Bio International', 'Lab Research'],
  },
];

export function CompetitionFinder() {
  const { createTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lunchlit_saved_competitions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSave = (id: string, title: string) => {
    let next: string[];
    if (savedIds.includes(id)) {
      next = savedIds.filter((item) => item !== id);
      toast.info('Removed from saved competitions');
    } else {
      next = [...savedIds, id];
      toast.success(`Saved "${title}" to your college prep list!`);
    }
    setSavedIds(next);
    localStorage.setItem('lunchlit_saved_competitions', JSON.stringify(next));
  };

  const addDeadlineToTasks = (comp: Competition) => {
    createTask.mutate({
      title: `Prepare & Register: ${comp.title}`,
      description: `Target deadline: ${comp.deadline}. Category: ${comp.category.toUpperCase()}. Official link: ${comp.url}`,
      priority: 'high',
      status: 'pending',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    toast.success(`Added "${comp.title}" deadline to your Tasks! 📝`);
  };

  const filteredCompetitions = useMemo(() => {
    return HIGH_SCHOOL_COMPETITIONS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Format filter
      if (formatFilter !== 'all' && item.format !== formatFilter && item.format !== 'both') return false;
      // Tier filter
      if (tierFilter !== 'all' && item.tier !== tierFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchOrg = item.organizer.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchOrg && !matchDesc && !matchTags) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, formatFilter, tierFilter]);

  const categories = [
    { id: 'all', label: 'All Arenas' },
    { id: 'stem', label: '🔬 STEM Research' },
    { id: 'coding', label: '💻 Coding & AI' },
    { id: 'math', label: '📐 Math Olympiad' },
    { id: 'business', label: '📈 Business & Pitch' },
    { id: 'writing', label: '✍️ Writing & Arts' },
    { id: 'robotics', label: '🤖 Robotics' },
    { id: 'debate', label: '🎙️ Speech & Debate' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-purple-500/10 border border-amber-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-display font-bold text-foreground">
              High School Competition Finder
            </h2>
            <Badge variant="secondary" className="text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
              v1.3 New
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Stand out to college admissions: compete in premier Olympiads, science fairs, hackathons, business pitch challenges, and writing awards.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 px-3 py-1.5 rounded-xl border border-border">
          <BookmarkCheck className="w-4 h-4 text-amber-500" />
          <span>{savedIds.length} Saved</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by competition name (e.g. Regeneron, USACO, AMC, DECA, Congressional)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm bg-card"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={selectedCategory === c.id ? 'default' : 'outline'}
              className="text-xs font-medium rounded-full h-8 px-3 shrink-0"
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="h-7 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Individual or Team</option>
            <option value="individual">👤 Individual Only</option>
            <option value="team">👥 Team Based</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-7 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Prestige Levels</option>
            <option value="Premier / Tier 1">👑 Premier / Tier 1</option>
            <option value="National">🇺🇸 National</option>
            <option value="International">🌐 International</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || formatFilter !== 'all' || tierFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFormatFilter('all');
                setTierFilter('all');
              }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset filters
            </Button>
          )}
        </div>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompetitions.map((comp) => {
          const isSaved = savedIds.includes(comp.id);

          return (
            <Card
              key={comp.id}
              className={`card-elevated transition-all flex flex-col justify-between hover:border-amber-500/50 ${
                isSaved ? 'border-amber-500/40 bg-amber-500/[0.02]' : ''
              }`}
            >
              <CardContent className="p-5 space-y-3.5 flex flex-col justify-between h-full">
                <div className="space-y-2.5">
                  {/* Top Bar: Organizer + Tier + Save */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-muted-foreground">
                        {comp.organizer}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold ${
                          comp.tier.includes('Premier')
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {comp.tier}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-amber-500 shrink-0"
                      onClick={() => toggleSave(comp.id, comp.title)}
                      title={isSaved ? 'Remove from saved' : 'Save competition'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-base text-foreground leading-snug">
                    {comp.title}
                  </h3>

                  {/* Badges / Metrics */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge variant="secondary" className="gap-1 font-medium bg-secondary text-foreground">
                      <Award className="w-3 h-3 text-amber-500" />
                      {comp.prizes}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      {comp.format === 'team' ? (
                        <><Users className="w-3 h-3 text-blue-500" /> Team</>
                      ) : comp.format === 'individual' ? (
                        <><User className="w-3 h-3 text-emerald-500" /> Individual</>
                      ) : (
                        <><Users className="w-3 h-3 text-purple-500" /> Individual or Team</>
                      )}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {comp.description}
                  </p>
                </div>

                {/* Footer info: Deadline + Actions */}
                <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 line-clamp-1">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{comp.deadline}</span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 px-2.5 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => addDeadlineToTasks(comp)}
                      title="Add deadline to tasks list"
                    >
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      Task
                    </Button>

                    <Button asChild size="sm" variant="default" className="gap-1 text-xs h-8 px-3 rounded-lg shadow-sm">
                      <a href={comp.url} target="_blank" rel="noopener noreferrer">
                        Compete
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCompetitions.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border p-6 space-y-3">
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-foreground">No competitions match your filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try resetting your search query or choosing "All Arenas" to view all available competitions.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFormatFilter('all');
              setTierFilter('all');
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

