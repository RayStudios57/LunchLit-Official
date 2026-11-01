import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Search, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  Building2, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export interface Internship {
  id: string;
  title: string;
  organization: string;
  category: 'stem' | 'tech' | 'medicine' | 'business' | 'government' | 'arts';
  locationType: 'remote' | 'in-person' | 'hybrid';
  location: string;
  compensation: 'Paid' | 'Stipend' | 'Unpaid / Experience' | 'Tuition-Free';
  gradeLevel: string; // e.g., '10th - 12th', '16+ years old'
  deadline: string;
  description: string;
  url: string;
  tags: string[];
}

export const HIGH_SCHOOL_INTERNSHIPS: Internship[] = [
  {
    id: 'nasa-ostem',
    title: 'NASA OSTEM High School Internships',
    organization: 'National Aeronautics and Space Administration (NASA)',
    category: 'stem',
    locationType: 'hybrid',
    location: 'NASA Centers nationwide (Ames, Glenn, Goddard, JPL, Langley) & Virtual',
    compensation: 'Paid',
    gradeLevel: '16+ years old (Sophomores - Seniors)',
    deadline: 'Spring, Summer, Fall cycles (Summer deadline: March)',
    description: 'Work alongside NASA scientists and engineers on real space exploration missions, robotics, software development, astrophysics, and Earth science data analysis.',
    url: 'https://intern.nasa.gov/',
    tags: ['Space', 'Aerospace', 'Coding', 'Engineering', 'Government'],
  },
  {
    id: 'nih-hs-sip',
    title: 'NIH High School Summer Internship Program (HS-SIP)',
    organization: 'National Institutes of Health (NIH)',
    category: 'medicine',
    locationType: 'in-person',
    location: 'Bethesda, MD and regional NIH biomedical facilities',
    compensation: 'Paid',
    gradeLevel: 'Juniors & Seniors (17+ by summer)',
    deadline: 'February 1 annually',
    description: 'Premier biomedical research internship. Spend 8 weeks working in world-class research laboratories alongside senior NIH principal investigators studying oncology, neuroscience, genetics, and public health.',
    url: 'https://www.training.nih.gov/research-training/hs/hs-sip/',
    tags: ['Biomedical', 'Pre-Med', 'Genetics', 'Neuroscience', 'Lab Research'],
  },
  {
    id: 'boa-student-leaders',
    title: 'Bank of America Student Leaders Program',
    organization: 'Bank of America Charitable Foundation',
    category: 'business',
    locationType: 'in-person',
    location: 'Local market nonprofit + Washington, D.C.',
    compensation: 'Paid',
    gradeLevel: 'Current Juniors and Seniors',
    deadline: 'Mid-January annually',
    description: '8-week paid summer internship with a leading local community nonprofit organization, culminating in an all-expenses-paid national Student Leadership Summit in Washington, D.C.',
    url: 'https://about.bankofamerica.com/en/making-an-impact/student-leaders',
    tags: ['Leadership', 'Nonprofit', 'Business', 'Civic Action', 'D.C. Summit'],
  },
  {
    id: 'microsoft-discovery',
    title: 'Microsoft High School Discovery Program',
    organization: 'Microsoft',
    category: 'tech',
    locationType: 'hybrid',
    location: 'Redmond, WA and select tech hubs',
    compensation: 'Paid',
    gradeLevel: 'Graduating High School Seniors',
    deadline: 'March - April annually',
    description: '4-week paid software engineering internship. Work on programming fundamentals, receive mentorship from Microsoft senior engineers, and develop real-world software prototypes.',
    url: 'https://careers.microsoft.com/students/us/en/ushighschoolprogram',
    tags: ['Software Engineering', 'Big Tech', 'Coding', 'Mentorship'],
  },
  {
    id: 'us-senate-pages',
    title: 'United States Senate Page Program',
    organization: 'United States Senate',
    category: 'government',
    locationType: 'in-person',
    location: 'Washington, D.C.',
    compensation: 'Paid',
    gradeLevel: 'High School Juniors (16 or 17 years old)',
    deadline: 'Varies by sponsoring Senator (Fall/Spring/Summer)',
    description: 'Serve on the Senate floor delivering legislative correspondence, bills, and amendments while attending the official Senate Page School. One of the most prestigious civic leadership programs in the nation.',
    url: 'https://www.senate.gov/reference/reference_index_subjects/Pages_vrd.htm',
    tags: ['Politics', 'Law', 'Government', 'Public Policy', 'Capitol Hill'],
  },
  {
    id: 'gwc-summer-immersion',
    title: 'Girls Who Code Summer Immersion Program',
    organization: 'Girls Who Code',
    category: 'tech',
    locationType: 'remote',
    location: '100% Online / Virtual',
    compensation: 'Stipend',
    gradeLevel: '9th - 11th grade female and non-binary students',
    deadline: 'February - March annually',
    description: 'Free 2-week virtual program covering web development, game design, UX, and AI ethics sponsored by leading companies like Amazon, MetLife, and Bank of America, with need-based student grants up to $300.',
    url: 'https://girlswhocode.com/programs/summer-immersion-program',
    tags: ['Coding', 'Web Dev', 'Game Design', 'Diversity in Tech', 'Virtual'],
  },
  {
    id: 'simons-summer-research',
    title: 'Simons Summer Research Fellowship',
    organization: 'Stony Brook University',
    category: 'stem',
    locationType: 'in-person',
    location: 'Stony Brook, NY',
    compensation: 'Stipend',
    gradeLevel: 'Current High School Juniors',
    deadline: 'February annually',
    description: 'Fellows join research teams in chemistry, physics, computer science, or engineering, learn state-of-the-art laboratory techniques, and write a formal research abstract.',
    url: 'https://www.stonybrook.edu/simons/',
    tags: ['Physics', 'Chemistry', 'Biochem', 'Lab Research', 'Fellowship'],
  },
  {
    id: 'hutton-fisheries',
    title: 'Hutton Junior Fisheries Biology Program',
    organization: 'American Fisheries Society',
    category: 'stem',
    locationType: 'in-person',
    location: 'All 50 US States, Puerto Rico, Canada, Mexico',
    compensation: 'Paid',
    gradeLevel: 'Rising High School Juniors & Seniors',
    deadline: 'Mid-January annually',
    description: '8-week hands-on paid summer internship ($3,000 stipend) paired 1-on-1 with professional fisheries and aquatic biologists conducting field sampling, conservation, and ecosystem restoration.',
    url: 'https://hutton.fisheries.org/',
    tags: ['Ecology', 'Marine Science', 'Conservation', 'Fieldwork', '$3k Stipend'],
  },
  {
    id: 'met-museum-interns',
    title: 'The Met High School Internship Program',
    organization: 'The Metropolitan Museum of Art',
    category: 'arts',
    locationType: 'in-person',
    location: 'New York City, NY',
    compensation: 'Paid',
    gradeLevel: 'Sophomores and Juniors in NY/NJ/CT',
    deadline: 'March annually',
    description: 'Paid career development internship exploring museum curation, art conservation, marketing, education, and digital media while working closely with Met curators.',
    url: 'https://www.metmuseum.org/about-the-met/internships/high-school',
    tags: ['Fine Arts', 'Museum Curation', 'Art History', 'Digital Media'],
  },
  {
    id: 'afrl-scholars',
    title: 'Air Force Research Laboratory (AFRL) Scholars',
    organization: 'U.S. Air Force',
    category: 'stem',
    locationType: 'in-person',
    location: 'Kirtland AFB (NM), Eglin AFB (FL), Wright-Patterson (OH), Rome (NY)',
    compensation: 'Paid',
    gradeLevel: '16+ years old',
    deadline: 'Mid-January annually',
    description: 'Competitive paid internships working with defense scientists and engineers on cutting-edge optics, lasers, aerospace vehicles, cybersecurity, and materials science.',
    url: 'https://afrlscholars.usra.edu/',
    tags: ['Defense', 'Aerospace', 'Cybersecurity', 'Lasers', 'Physics'],
  },
  {
    id: 'sandia-hs-interns',
    title: 'Sandia National Laboratories High School Internships',
    organization: 'Sandia National Laboratories / Dept. of Energy',
    category: 'stem',
    locationType: 'hybrid',
    location: 'Albuquerque, NM & Livermore, CA',
    compensation: 'Paid',
    gradeLevel: 'High school students 16+ with 3.0+ GPA',
    deadline: 'Rolling (Spring applications for summer)',
    description: 'Year-round and summer paid technical internships in supercomputing, cybersecurity, advanced manufacturing, and national security research.',
    url: 'https://www.sandia.gov/careers/career-possibilities/students-and-interns/',
    tags: ['Supercomputing', 'DOE', 'Cyber', 'National Security'],
  },
  {
    id: 'monell-science-apprenticeship',
    title: 'Monell Science Apprenticeship Program (MSAP)',
    organization: 'Monell Chemical Senses Center',
    category: 'medicine',
    locationType: 'in-person',
    location: 'Philadelphia, PA',
    compensation: 'Paid',
    gradeLevel: 'High School & Undergraduates (16+)',
    deadline: 'Mid-January annually',
    description: '7-week intensive paid apprenticeship conducting scientific research on chemical senses (taste and smell) with applications in human nutrition, medicine, and olfactory science.',
    url: 'https://monell.org/science-apprenticeship-program/',
    tags: ['Sensory Science', 'Biochemistry', 'Philadelphia', 'Lab Research'],
  },
  {
    id: 'kaiser-launch',
    title: 'Kaiser Permanente LAUNCH Summer Internship',
    organization: 'Kaiser Permanente',
    category: 'medicine',
    locationType: 'in-person',
    location: 'Northern California & Kaiser hospital networks',
    compensation: 'Paid',
    gradeLevel: 'High school students 16-19 years old',
    deadline: 'December - January annually',
    description: 'Paid summer internship program designed to build pathways for underrepresented youth in healthcare careers, nursing, clinical operations, and health administration.',
    url: 'https://www.kaiserpermanencelaunch.org/',
    tags: ['Healthcare', 'Clinical', 'Nursing', 'Health Admin', 'Diversity'],
  },
  {
    id: 'fred-hutch-summer',
    title: 'Fred Hutch High School Summer Internship (SHIP)',
    organization: 'Fred Hutchinson Cancer Center',
    category: 'medicine',
    locationType: 'in-person',
    location: 'Seattle, WA',
    compensation: 'Paid',
    gradeLevel: 'High School Rising Seniors',
    deadline: 'March annually',
    description: '8-week paid full-time biomedical research internship exploring cancer biology, immunology, and epidemiology alongside cancer research scientists.',
    url: 'https://www.fredhutch.org/en/education-training/high-school-students/ship.html',
    tags: ['Oncology', 'Immunology', 'Biomedical', 'Seattle', 'Cancer Research'],
  },
  {
    id: 'intern-group-virtual',
    title: 'The Intern Group High School Virtual Internships',
    organization: 'The Intern Group Global Network',
    category: 'business',
    locationType: 'remote',
    location: '100% Online / Remote',
    compensation: 'Tuition-Free',
    gradeLevel: 'Ages 15-18 worldwide',
    deadline: 'Rolling admission every month',
    description: 'Remote internship placements with companies and international organizations in marketing, business entrepreneurship, software development, graphic design, and green tech.',
    url: 'https://www.theinterngroup.com/virtual-internships/',
    tags: ['Global', 'Remote', 'Marketing', 'Business', 'Flex Hours'],
  },
];

export function InternshipFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [payFilter, setPayFilter] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lunchlit_saved_internships');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSave = (id: string, title: string) => {
    let next: string[];
    if (savedIds.includes(id)) {
      next = savedIds.filter((item) => item !== id);
      toast.info('Removed from saved internships');
    } else {
      next = [...savedIds, id];
      toast.success(`Saved "${title}" to your college prep list!`);
    }
    setSavedIds(next);
    localStorage.setItem('lunchlit_saved_internships', JSON.stringify(next));
  };

  const filteredInternships = useMemo(() => {
    return HIGH_SCHOOL_INTERNSHIPS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Location type filter
      if (locationFilter !== 'all' && item.locationType !== locationFilter) return false;
      // Compensation filter
      if (payFilter === 'paid' && item.compensation !== 'Paid' && item.compensation !== 'Stipend') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchOrg = item.organization.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchLoc = item.location.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchDesc && !matchTags && !matchLoc) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, locationFilter, payFilter]);

  const categories = [
    { id: 'all', label: 'All Fields' },
    { id: 'stem', label: '🔬 STEM' },
    { id: 'tech', label: '💻 Tech & Code' },
    { id: 'medicine', label: '🩺 Healthcare / Pre-Med' },
    { id: 'business', label: '💼 Business & Leadership' },
    { id: 'government', label: '🏛️ Government & Law' },
    { id: 'arts', label: '🎨 Arts & Media' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Explainer Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-indigo-500/10 border border-primary/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Briefcase className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-display font-bold text-foreground">
              High School Internship Finder
            </h2>
            <Badge variant="secondary" className="text-[11px] font-semibold bg-primary/15 text-primary border-primary/30">
              v1.3 New
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Explore 20+ verified, highly prestigious paid research, government, tech, and healthcare internships curated for high school students.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 px-3 py-1.5 rounded-xl border border-border">
          <BookmarkCheck className="w-4 h-4 text-primary" />
          <span>{savedIds.length} Saved</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by role, company (e.g. NASA, NIH, Microsoft), or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm bg-card"
          />
        </div>

        {/* Categories Carousel/Pills */}
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

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-7 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Any Format</option>
            <option value="remote">🌐 Remote / Online</option>
            <option value="in-person">🏢 In-Person</option>
            <option value="hybrid">⚡ Hybrid</option>
          </select>

          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value)}
            className="h-7 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Compensation</option>
            <option value="paid">💵 Paid / Stipend Only</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || locationFilter !== 'all' || payFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setLocationFilter('all');
                setPayFilter('all');
              }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset filters
            </Button>
          )}
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInternships.map((internship) => {
          const isSaved = savedIds.includes(internship.id);

          return (
            <Card
              key={internship.id}
              className={`card-elevated transition-all flex flex-col justify-between hover:border-primary/50 ${
                isSaved ? 'border-primary/40 bg-primary/[0.02]' : ''
              }`}
            >
              <CardContent className="p-5 space-y-3.5 flex flex-col justify-between h-full">
                <div className="space-y-2.5">
                  {/* Top Bar: Org + Save button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{internship.organization}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                      onClick={() => toggleSave(internship.id, internship.title)}
                      title={isSaved ? 'Remove from saved' : 'Save internship'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-primary fill-primary/20" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-base text-foreground leading-snug">
                    {internship.title}
                  </h3>

                  {/* Badges / Metrics */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge variant="secondary" className="gap-1 font-medium bg-secondary text-foreground">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      {internship.compensation}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 font-medium bg-secondary text-foreground">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {internship.locationType === 'remote' ? '100% Remote' : internship.locationType === 'hybrid' ? 'Hybrid' : 'In-Person'}
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
                      <GraduationCap className="w-3 h-3" />
                      {internship.gradeLevel}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {internship.description}
                  </p>
                </div>

                {/* Footer info: Deadline + Action button */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 line-clamp-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{internship.deadline}</span>
                  </div>

                  <Button asChild size="sm" variant="default" className="gap-1.5 text-xs h-8 px-3 rounded-lg shadow-sm">
                    <a href={internship.url} target="_blank" rel="noopener noreferrer">
                      Apply / Details
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInternships.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border p-6 space-y-3">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-foreground">No internships match your current filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or clicking "Reset filters" above to explore all opportunities.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setLocationFilter('all');
              setPayFilter('all');
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

