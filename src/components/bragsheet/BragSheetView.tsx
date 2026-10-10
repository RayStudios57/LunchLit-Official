import { useState } from 'react';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trophy, Clock, Award, TrendingUp, Sparkles, GraduationCap, Lightbulb, User, Mail } from 'lucide-react';
import { BragSheetEntryCard } from './BragSheetEntryCard';
import { BragSheetEntryForm } from './BragSheetEntryForm';
import { BragSheetSuggestions } from './BragSheetSuggestions';
import { BragSheetPDFExport } from './BragSheetPDFExport';
import { BragSheetAcademicsForm } from './BragSheetAcademicsForm';
import { BragSheetInsightsForm } from './BragSheetInsightsForm';
import { DraggableActivityList } from './DraggableActivityList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { useBragSheetInsights } from '@/hooks/useBragSheetInsights';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyProfile, dummyAcademics, dummyInsights } from '@/data/presentationDummyData';

export function BragSheetView() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isPresentationMode } = usePresentationMode();
  const { entries, entriesByYear, stats, isLoading } = useBragSheet();
  const { academics: dbAcademics } = useBragSheetAcademics();
  const { insights: dbInsights } = useBragSheetInsights();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'activities' | 'awards' | 'insights'>('overview');

  const displayUser = user || (isPresentationMode ? { id: 'demo-user', email: 'krishna@lunchlit.app' } : null);
  const displayProfile = profile || (isPresentationMode ? dummyProfile : null);
  const academics = dbAcademics || (isPresentationMode ? dummyAcademics : null);
  const insights = dbInsights && dbInsights.length > 0 ? dbInsights : (isPresentationMode ? dummyInsights : []);

  // Filter entries by category
  const activityEntries = entries.filter(e => 
    ['volunteering', 'job', 'internship', 'leadership', 'club', 'extracurricular', 'other'].includes(e.category)
  );
  const awardEntries = entries.filter(e => e.category === 'award' || e.category === 'academic');

  if (!displayUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Your Brag Sheet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Track your achievements, activities, and accomplishments throughout school. 
          Perfect for college and honors applications!
        </p>
        <Button asChild>
          <Link to="/auth">Sign in to access LunchLit</Link>
        </Button>
      </div>
    );
  }

  const sortedYears = Object.keys(entriesByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header with Student Info */}
      <Card className="card-elevated bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">{displayProfile?.full_name || 'Student'}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {displayUser?.email}
                  </span>
                  {displayProfile?.grade_level && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {displayProfile.grade_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <BragSheetPDFExport entries={entries} entriesByYear={entriesByYear} profile={displayProfile} academics={academics} insights={insights} />
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Entry</DialogTitle>
                  </DialogHeader>
                  <BragSheetEntryForm onSuccess={() => setIsAddingEntry(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
                <p className="text-xs text-muted-foreground">Hours Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sortedYears.length}</p>
                <p className="text-xs text-muted-foreground">Years Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="academics" className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Academics
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="awards" className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                Awards
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No entries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your portfolio by adding your first entry!
                  </p>
                  <Button onClick={() => setIsAddingEntry(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedYears.map((year) => (
                    <div key={year}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary" />
                        {year}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({entriesByYear[year].length} entries)
                        </span>
                      </h3>
                      <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
                        {entriesByYear[year].map((entry) => (
                          <BragSheetEntryCard key={entry.id} entry={entry} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Academics Tab */}
            <TabsContent value="academics">
              <BragSheetAcademicsForm />
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Top Activities</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag to reorder and prioritize your most important activities first
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setIsAddingEntry(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
                
                {activityEntries.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No activities added yet.</p>
                  </div>
                ) : (
                  <DraggableActivityList entries={activityEntries} />
                )}
              </div>
            </TabsContent>

            {/* Awards Tab */}
            <TabsContent value="awards">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Awards & Honors</h3>
                    <p className="text-sm text-muted-foreground">
                      Recognition, achievements, and academic honors
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setIsAddingEntry(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Award
                  </Button>
                </div>
                
                {awardEntries.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No awards added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {awardEntries.map((entry) => (
                      <BragSheetEntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights">
              <BragSheetInsightsForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Suggestions Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Suggestions
          </CardTitle>
          <CardDescription>
            Based on your tasks and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BragSheetSuggestions />
        </CardContent>
      </Card>
    </div>
  );
}
