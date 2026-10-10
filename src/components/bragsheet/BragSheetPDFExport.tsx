import { Button } from '@/components/ui/button';
import { FileDown, Loader2, FileText, Sparkles, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BragSheetEntry, BragCategory } from '@/hooks/useBragSheet';
import { Profile } from '@/hooks/useProfile';
import { BragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { BragSheetInsight, INSIGHT_QUESTIONS } from '@/hooks/useBragSheetInsights';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface BragSheetPDFExportProps {
  entries: BragSheetEntry[];
  entriesByYear: Record<string, BragSheetEntry[]>;
  profile: Profile | null;
  academics?: BragSheetAcademics | null;
  insights?: BragSheetInsight[];
}

type ExportStyle = 'raw' | 'fancy' | 'commonapp';

const categoryLabels: Record<BragCategory, string> = {
  volunteering: 'Community Service',
  job: 'Work Experience',
  award: 'Honors & Awards',
  internship: 'Internship',
  leadership: 'Leadership',
  club: 'Clubs & Organizations',
  extracurricular: 'Extracurricular Activities',
  academic: 'Academic Achievement',
  other: 'Other Activities',
};

// Strip emoji + invisible chars + replace non-WinAnsi punctuation so jsPDF's
// standard fonts don't render gibberish boxes/letters or stray kerning.
const safe = (text: string | undefined | null): string => {
  if (!text) return '';
  return String(text)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/\u25B8/g, '>')
    .replace(/\u2713/g, 'v')
    // Strip emoji / pictographs / symbols
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\uFE0F\u200D]/gu,
      ''
    )
    // Strip zero-width / invisible / BOM / soft-hyphen characters that
    // confuse jsPDF spacing and cause "weird letters" between glyphs.
    .replace(/[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    // Strip control chars (except newline/tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip any remaining non-ASCII (jsPDF standard fonts are WinAnsi)
    .replace(/[^\x00-\xFF]/g, '')
    // Collapse runs of ASCII whitespace so monkey-patched titles don't
    // gain extra spaces from stripped icons (e.g. "📚  ACADEMIC").
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

export function BragSheetPDFExport({ entries, entriesByYear, profile, academics, insights = [] }: BragSheetPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getInsightAnswer = (key: string) => {
    return insights.find(i => i.question_key === key)?.answer || '';
  };

  const generatePDF = async (style: ExportStyle) => {
    setIsGenerating(true);
    setIsDialogOpen(false);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Sanitize every string passed to doc.text so emoji / smart quotes /
      // em-dashes don't render as gibberish under jsPDF's WinAnsi fonts.
      const _origText = doc.text.bind(doc);
      doc.text = ((text: any, ...rest: any[]) => {
        const clean = Array.isArray(text)
          ? text.map((t) => (typeof t === 'string' ? safe(t) : t))
          : typeof text === 'string'
            ? safe(text)
            : text;
        return _origText(clean, ...rest);
      }) as any;
      const _origSplit = doc.splitTextToSize.bind(doc);
      doc.splitTextToSize = ((text: any, ...rest: any[]) =>
        _origSplit(typeof text === 'string' ? safe(text) : text, ...rest)) as any;

      if (style === 'raw') {
        await generateRawPDF(doc);
      } else if (style === 'commonapp') {
        await generateCommonAppPDF(doc);
      } else {
        await generateFancyPDF(doc);
      }

      const styleSuffix = style === 'fancy' ? '_Professional' : style === 'commonapp' ? '_CommonApp' : '';
      const fileName = profile?.full_name
        ? `${profile.full_name.replace(/\s+/g, '_')}_Brag_Sheet${styleSuffix}.pdf`
        : `Brag_Sheet${styleSuffix}.pdf`;
      doc.save(fileName);

      const styleNames = { raw: 'plain text', fancy: 'professional', commonapp: 'Common App format' };
      toast({
        title: 'PDF exported successfully!',
        description: `Your ${styleNames[style]} brag sheet has been downloaded.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error generating PDF',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRawPDF = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Simple header
    doc.setFontSize(16);
    doc.setFont('courier', 'bold');
    doc.text('BRAG SHEET', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    if (profile?.full_name) {
      doc.text(`Name: ${profile.full_name}`, margin, yPos);
      yPos += 5;
    }
    if (profile?.school_name) {
      doc.text(`School: ${profile.school_name}`, margin, yPos);
      yPos += 5;
    }
    if (profile?.grade_level) {
      doc.text(`Grade: ${profile.grade_level}`, margin, yPos);
      yPos += 5;
    }
    doc.text(`Date: ${format(new Date(), 'MM/dd/yyyy')}`, margin, yPos);
    yPos += 10;

    // Separator
    doc.text('='.repeat(60), margin, yPos);
    yPos += 8;

    // Academics
    if (academics) {
      doc.setFont('courier', 'bold');
      doc.text('ACADEMICS', margin, yPos);
      yPos += 6;
      doc.setFont('courier', 'normal');

      if (academics.gpa_unweighted) {
        doc.text(`GPA (Unweighted): ${academics.gpa_unweighted}`, margin, yPos);
        yPos += 5;
      }
      if (academics.gpa_weighted) {
        doc.text(`GPA (Weighted): ${academics.gpa_weighted}`, margin, yPos);
        yPos += 5;
      }

      if (academics.test_scores && academics.test_scores.length > 0) {
        doc.text('Test Scores:', margin, yPos);
        yPos += 5;
        for (const score of academics.test_scores) {
          const scoreText = score.subject
            ? `  - ${score.type} ${score.subject}: ${score.score}`
            : `  - ${score.type}: ${score.score}`;
          doc.text(scoreText, margin, yPos);
          yPos += 4;
        }
      }

      if (academics.courses && academics.courses.length > 0) {
        checkNewPage(15);
        doc.text('Courses:', margin, yPos);
        yPos += 5;
        for (const course of academics.courses) {
          const courseText = course.teacher
            ? `  - ${course.name} (${course.teacher})`
            : `  - ${course.name}`;
          doc.text(courseText, margin, yPos);
          yPos += 4;
        }
      }

      if (academics.colleges_applying && academics.colleges_applying.length > 0) {
        checkNewPage(10);
        doc.text(`Colleges: ${academics.colleges_applying.join(', ')}`, margin, yPos);
        yPos += 5;
      }

      yPos += 5;
      doc.text('-'.repeat(60), margin, yPos);
      yPos += 8;
    }

    // Entries by category
    const categoryOrder: BragCategory[] = ['leadership', 'extracurricular', 'club', 'volunteering', 'job', 'internship', 'award', 'academic', 'other'];
    const entriesByCategory = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<BragCategory, BragSheetEntry[]>);

    for (const category of categoryOrder) {
      const categoryEntries = entriesByCategory[category];
      if (!categoryEntries || categoryEntries.length === 0) continue;

      checkNewPage(15);
      doc.setFont('courier', 'bold');
      doc.text(categoryLabels[category].toUpperCase(), margin, yPos);
      yPos += 6;
      doc.setFont('courier', 'normal');

      for (const entry of categoryEntries) {
        checkNewPage(20);

        doc.text(`* ${entry.title}`, margin, yPos);
        yPos += 5;

        if (entry.position_role) {
          doc.text(`  Role: ${entry.position_role}`, margin, yPos);
          yPos += 4;
        }

        doc.text(`  Grade: ${entry.grade_level} | Year: ${entry.school_year}`, margin, yPos);
        yPos += 4;

        if (entry.grades_participated && entry.grades_participated.length > 0) {
          doc.text(`  Participated: ${entry.grades_participated.join(', ')}`, margin, yPos);
          yPos += 4;
        }

        if (entry.hours_spent) {
          doc.text(`  Hours: ${entry.hours_spent}`, margin, yPos);
          yPos += 4;
        }

        if (entry.description) {
          const descLines = doc.splitTextToSize(`  ${entry.description}`, contentWidth - 4);
          checkNewPage(descLines.length * 4);
          doc.text(descLines, margin, yPos);
          yPos += descLines.length * 4;
        }

        if (entry.impact) {
          const impactLines = doc.splitTextToSize(`  Impact: ${entry.impact}`, contentWidth - 4);
          checkNewPage(impactLines.length * 4);
          doc.text(impactLines, margin, yPos);
          yPos += impactLines.length * 4;
        }

        yPos += 3;
      }

      yPos += 5;
    }

    // Insight questions
    const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
    if (answeredInsights.length > 0) {
      checkNewPage(20);
      doc.text('-'.repeat(60), margin, yPos);
      yPos += 8;

      doc.setFont('courier', 'bold');
      doc.text('INSIGHT QUESTIONS', margin, yPos);
      yPos += 8;

      for (const question of answeredInsights) {
        const answer = getInsightAnswer(question.key);
        if (!answer) continue;

        checkNewPage(25);
        doc.setFont('courier', 'bold');
        const qLines = doc.splitTextToSize(`Q: ${question.question}`, contentWidth);
        doc.text(qLines, margin, yPos);
        yPos += qLines.length * 4 + 2;

        doc.setFont('courier', 'normal');
        const aLines = doc.splitTextToSize(`A: ${answer}`, contentWidth);
        checkNewPage(aLines.length * 4);
        doc.text(aLines, margin, yPos);
        yPos += aLines.length * 4 + 6;
      }
    }

    // Summary
    checkNewPage(30);
    doc.text('='.repeat(60), margin, yPos);
    yPos += 8;
    doc.setFont('courier', 'bold');
    doc.text('SUMMARY', margin, yPos);
    yPos += 6;
    doc.setFont('courier', 'normal');

    const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
    const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;

    doc.text(`Total Activities: ${entries.length}`, margin, yPos);
    yPos += 5;
    doc.text(`Verified: ${verifiedCount}`, margin, yPos);
    yPos += 5;
    doc.text(`Total Hours: ${totalHours}`, margin, yPos);
  };

  const loadImageAsBase64 = async (
    stored: string
  ): Promise<{ data: string; format: 'PNG' | 'JPEG' } | null> => {
    try {
      // Resolve to a storage path
      let filePath = stored;
      try {
        const u = new URL(stored);
        const parts = u.pathname.split('/');
        const idx = parts.findIndex((p) => p === 'brag-sheet-images');
        if (idx !== -1) filePath = parts.slice(idx + 1).join('/');
      } catch {
        // already a path
      }

      let fetchUrl: string | null = null;
      // Try signed URL (private bucket)
      const { data: signed } = await supabase.storage
        .from('brag-sheet-images')
        .createSignedUrl(filePath, 300);
      if (signed?.signedUrl) fetchUrl = signed.signedUrl;
      // Fallback: original string if it was a URL
      if (!fetchUrl && /^https?:\/\//i.test(stored)) fetchUrl = stored;
      if (!fetchUrl) return null;

      const response = await fetch(fetchUrl);
      if (!response.ok) return null;
      const blob = await response.blob();
      const format: 'PNG' | 'JPEG' = blob.type.includes('png') ? 'PNG' : 'JPEG';
      const data = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
      if (!data) return null;
      return { data, format };
    } catch {
      return null;
    }
  };

  const generateCommonAppPDF = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Common App color palette - clean and formal
    const navyBlue = [10, 32, 75];
    const darkText = [30, 30, 30];
    const mutedText = [100, 100, 100];
    const borderGray = [200, 200, 200];
    const sectionBg = [248, 248, 250];

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin - 20) {
        addPageNumber();
        doc.addPage();
        yPos = margin + 10;
        return true;
      }
      return false;
    };

    const addPageNumber = () => {
      const pageNum = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(...mutedText);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    };

    const drawSectionTitle = (title: string, number?: string) => {
      checkNewPage(20);

      // Section header bar
      doc.setFillColor(...navyBlue);
      doc.rect(margin, yPos, contentWidth, 8, 'F');

      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(255, 255, 255);
      const titleText = number ? `${number}. ${title}` : title;
      doc.text(titleText.toUpperCase(), margin + 4, yPos + 5.5);
      doc.setTextColor(0);
      yPos += 14;
    };

    const drawFieldRow = (label: string, value: string, indent = 0) => {
      if (!value) return;
      checkNewPage(8);

      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      doc.setTextColor(...mutedText);
      doc.text(label, margin + indent, yPos);

      doc.setFont('times', 'normal');
      doc.setTextColor(...darkText);
      const labelWidth = doc.getTextWidth(label) + 4;
      const valueLines = doc.splitTextToSize(value, contentWidth - labelWidth - indent - 10);
      doc.text(valueLines, margin + indent + labelWidth, yPos);
      yPos += valueLines.length * 4 + 2;
    };

    const drawActivityBox = (entry: BragSheetEntry, index: number) => {
      checkNewPage(55);

      // Activity box background
      doc.setFillColor(...sectionBg);
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.3);

      // Calculate height dynamically
      let boxHeight = 45;
      if (entry.description) {
        const descLines = doc.splitTextToSize(entry.description, contentWidth - 20);
        boxHeight += descLines.length * 4;
      }

      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 1, 1, 'FD');

      // Activity number badge
      doc.setFillColor(...navyBlue);
      doc.circle(margin + 8, yPos + 8, 5, 'F');
      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(index.toString(), margin + 6.5, yPos + 10);

      // Activity type (category)
      doc.setFontSize(8);
      doc.setFont('times', 'normal');
      doc.setTextColor(...mutedText);
      doc.text(categoryLabels[entry.category].toUpperCase(), margin + 18, yPos + 8);

      // Activity title
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.setTextColor(...darkText);
      doc.text(entry.title, margin + 18, yPos + 16);

      // Position/Role (if any)
      let detailY = yPos + 22;
      if (entry.position_role) {
        doc.setFontSize(10);
        doc.setFont('times', 'italic');
        doc.setTextColor(...navyBlue);
        doc.text(entry.position_role, margin + 18, detailY);
        detailY += 5;
      }

      // Organization/School Year line
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(...mutedText);
      const metaInfo = [];
      if (entry.grades_participated && entry.grades_participated.length > 0) {
        metaInfo.push(`Grades: ${entry.grades_participated.join(', ')}`);
      } else {
        metaInfo.push(entry.grade_level);
      }
      metaInfo.push(entry.school_year);
      if (entry.hours_spent) {
        metaInfo.push(`${entry.hours_spent} hrs/yr`);
      }
      doc.text(metaInfo.join('  |  '), margin + 18, detailY);
      detailY += 6;

      // Description (limited to ~150 chars like Common App)
      if (entry.description) {
        doc.setFont('times', 'normal');
        doc.setTextColor(...darkText);
        doc.setFontSize(9);
        const truncatedDesc = entry.description.length > 150
          ? entry.description.substring(0, 147) + '...'
          : entry.description;
        const descLines = doc.splitTextToSize(truncatedDesc, contentWidth - 24);
        doc.text(descLines, margin + 18, detailY);
      }

      yPos += boxHeight + 6;
    };

    // ========== HEADER ==========
    doc.setFillColor(...navyBlue);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Activities & Honors Summary', margin, 20);

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.setTextColor(200, 210, 230);
    doc.text('Common Application Format', margin, 28);

    // Date on right
    doc.setTextColor(255, 255, 255);
    doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth - margin, 20, { align: 'right' });

    yPos = 45;

    // ========== STUDENT INFORMATION ==========
    drawSectionTitle('Student Information', 'I');

    doc.setFillColor(...sectionBg);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, 28, 1, 1, 'FD');

    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.setTextColor(...darkText);
    doc.text(profile?.full_name || 'Student Name', margin + 6, yPos + 10);

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.setTextColor(...mutedText);
    const studentInfo = [];
    if (profile?.school_name) studentInfo.push(profile.school_name);
    if (profile?.grade_level) studentInfo.push(`Grade ${profile.grade_level}`);
    doc.text(studentInfo.join('  •  '), margin + 6, yPos + 20);

    yPos += 36;

    // ========== ACADEMIC RECORD ==========
    if (academics && (academics.gpa_weighted || academics.gpa_unweighted || (academics.test_scores && academics.test_scores.length > 0))) {
      drawSectionTitle('Academic Record', 'II');

      // GPA Box
      if (academics.gpa_weighted || academics.gpa_unweighted) {
        doc.setFillColor(...sectionBg);
        doc.roundedRect(margin, yPos, contentWidth / 2 - 4, 22, 1, 1, 'F');

        doc.setFontSize(8);
        doc.setFont('times', 'bold');
        doc.setTextColor(...mutedText);
        doc.text('CUMULATIVE GPA', margin + 6, yPos + 7);

        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.setTextColor(...navyBlue);
        const gpaDisplay = [];
        if (academics.gpa_unweighted) gpaDisplay.push(`${academics.gpa_unweighted} (UW)`);
        if (academics.gpa_weighted) gpaDisplay.push(`${academics.gpa_weighted} (W)`);
        doc.text(gpaDisplay.join('  /  '), margin + 6, yPos + 16);

        yPos += 28;
      }

      // Test Scores
      if (academics.test_scores && academics.test_scores.length > 0) {
        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...navyBlue);
        doc.text('Standardized Test Scores:', margin, yPos);
        yPos += 6;

        doc.setFont('times', 'normal');
        doc.setTextColor(...darkText);
        for (const score of academics.test_scores) {
          checkNewPage(6);
          const scoreText = score.subject
            ? `${score.type} ${score.subject}: ${score.score}`
            : `${score.type}: ${score.score}`;
          doc.text(`• ${scoreText}`, margin + 6, yPos);
          yPos += 5;
        }
        yPos += 4;
      }
    }

    // ========== HONORS (Awards) ==========
    const honorEntries = entries.filter(e => e.category === 'award' || e.category === 'academic');
    if (honorEntries.length > 0) {
      drawSectionTitle('Honors & Awards', 'III');

      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(...mutedText);
      doc.text('List up to 5 academic honors received from 9th grade onward', margin, yPos);
      yPos += 8;

      for (let i = 0; i < Math.min(honorEntries.length, 5); i++) {
        const honor = honorEntries[i];
        checkNewPage(14);

        // Honor row
        doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250);
        doc.rect(margin, yPos - 2, contentWidth, 10, 'F');

        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...darkText);
        doc.text(`${i + 1}. ${honor.title}`, margin + 4, yPos + 4);

        // Level indicator
        doc.setFont('times', 'normal');
        doc.setTextColor(...mutedText);
        const levelText = honor.grades_participated?.join(', ') || honor.grade_level;
        doc.text(levelText, pageWidth - margin - 30, yPos + 4);

        yPos += 12;
      }
      yPos += 6;
    }

    // ========== ACTIVITIES ==========
    const activityEntries = entries.filter(e =>
      !['award', 'academic'].includes(e.category)
    );

    if (activityEntries.length > 0) {
      drawSectionTitle('Activities', 'IV');

      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(...mutedText);
      doc.text('Please list your principal extracurricular, volunteer, and work activities in order of importance', margin, yPos);
      yPos += 10;

      // Only show top 10 activities like Common App
      const topActivities = activityEntries.slice(0, 10);
      for (let i = 0; i < topActivities.length; i++) {
        drawActivityBox(topActivities[i], i + 1);
      }

      if (activityEntries.length > 10) {
        doc.setFontSize(8);
        doc.setFont('times', 'italic');
        doc.setTextColor(...mutedText);
        doc.text(`+ ${activityEntries.length - 10} additional activities not shown`, margin, yPos);
        yPos += 8;
      }
    }

    // ========== ADDITIONAL INFORMATION ==========
    const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
    if (answeredInsights.length > 0) {
      checkNewPage(40);
      drawSectionTitle('Additional Information', 'V');

      for (const question of answeredInsights) {
        const answer = getInsightAnswer(question.key);
        if (!answer) continue;

        checkNewPage(30);

        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...navyBlue);
        const qLines = doc.splitTextToSize(question.question, contentWidth - 8);
        doc.text(qLines, margin, yPos);
        yPos += qLines.length * 4 + 3;

        doc.setFont('times', 'normal');
        doc.setTextColor(...darkText);
        // Limit answer preview like Common App's 650 word essays (approximated as 3000 chars)
        const truncAnswer = answer.length > 500 ? answer.substring(0, 497) + '...' : answer;
        const aLines = doc.splitTextToSize(truncAnswer, contentWidth - 8);
        checkNewPage(aLines.length * 4 + 8);
        doc.text(aLines, margin, yPos);
        yPos += aLines.length * 4 + 10;
      }
    }

    // ========== SUMMARY STATS ==========
    checkNewPage(35);

    doc.setFillColor(...navyBlue);
    doc.rect(margin, yPos, contentWidth, 0.5, 'F');
    yPos += 8;

    const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
    const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;

    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(...mutedText);
    doc.text('PORTFOLIO SUMMARY', margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.setTextColor(...darkText);
    doc.text(`Total Activities: ${entries.length}   |   Verified Entries: ${verifiedCount}   |   Total Hours Logged: ${totalHours}`, margin, yPos);

    // ========== FOOTER ==========
    addPageNumber();

    // Footer bar
    doc.setFillColor(...navyBlue);
    doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');
  };

  const generateFancyPDF = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Enhanced color palette
    const primaryColor = [79, 70, 229]; // Indigo
    const primaryLight = [129, 140, 248]; // Indigo light
    const accentColor = [16, 185, 129]; // Emerald
    const warmAccent = [251, 146, 60]; // Orange
    const textDark = [15, 23, 42]; // Slate 900
    const textMuted = [71, 85, 105]; // Slate 600
    const bgLight = [248, 250, 252]; // Slate 50
    const bgCard = [241, 245, 249]; // Slate 100

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin - 15) {
        // Add page number before new page
        addPageFooter();
        doc.addPage();
        yPos = margin + 5;
        return true;
      }
      return false;
    };

    const addPageFooter = () => {
      const pageNum = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('times', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    const drawSectionHeader = (title: string, icon?: string) => {
      checkNewPage(18);

      // Gradient-like effect with two rectangles
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, yPos - 2, contentWidth, 12, 2, 2, 'F');
      doc.setFillColor(...primaryLight);
      doc.roundedRect(margin + contentWidth - 40, yPos - 2, 40, 12, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(icon ? `${icon}  ${title}` : title, margin + 6, yPos + 6);
      doc.setTextColor(0, 0, 0);
      yPos += 18;
    };

    const drawDivider = () => {
      doc.setDrawColor(...bgCard);
      doc.setLineWidth(0.5);
      doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);
      yPos += 6;
    };

    // ========== HEADER ==========
    // Gradient header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 42, 'F');
    doc.setFillColor(...primaryLight);
    doc.rect(pageWidth - 60, 0, 60, 42, 'F');

    // Decorative accent bar
    doc.setFillColor(...accentColor);
    doc.rect(0, 42, pageWidth, 3, 'F');

    // Title
    doc.setFontSize(26);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Student Brag Sheet', margin, 26);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.setTextColor(200, 200, 255);
    doc.text('Academic & Extracurricular Portfolio', margin, 36);

    doc.setTextColor(0);
    yPos = 55;

    // ========== STUDENT INFO CARD ==========
    doc.setFillColor(...bgLight);
    doc.roundedRect(margin, yPos, contentWidth, 32, 4, 4, 'F');

    // Left accent bar
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, yPos, 4, 32, 2, 2, 'F');

    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(...textDark);
    if (profile?.full_name) {
      doc.text(profile.full_name, margin + 14, yPos + 13);
    }

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.setTextColor(...textMuted);
    let infoLine = [];
    if (profile?.school_name) infoLine.push(profile.school_name);
    if (profile?.grade_level) infoLine.push(`Grade ${profile.grade_level}`);
    if (infoLine.length > 0) {
      doc.text(infoLine.join('  •  '), margin + 14, yPos + 23);
    }

    // Date badge on right
    doc.setFillColor(...primaryLight);
    doc.roundedRect(pageWidth - margin - 50, yPos + 10, 46, 14, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(format(new Date(), 'MMM d, yyyy'), pageWidth - margin - 27, yPos + 19, { align: 'center' });

    doc.setTextColor(0);
    yPos += 42;

    // ========== QUICK STATS ==========
    const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
    const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;
    const yearsActive = Object.keys(entriesByYear).length;

    const statsWidth = (contentWidth - 12) / 4;
    const stats = [
      { label: 'Activities', value: entries.length.toString(), color: primaryColor },
      { label: 'Verified', value: verifiedCount.toString(), color: accentColor },
      { label: 'Hours', value: totalHours.toString(), color: warmAccent },
      { label: 'Years', value: yearsActive.toString(), color: primaryLight },
    ];

    stats.forEach((stat, i) => {
      const x = margin + i * (statsWidth + 4);
      doc.setFillColor(...stat.color);
      doc.roundedRect(x, yPos, statsWidth, 22, 3, 3, 'F');

      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(stat.value, x + statsWidth / 2, yPos + 10, { align: 'center' });

      doc.setFontSize(7);
      doc.setFont('times', 'normal');
      doc.text(stat.label, x + statsWidth / 2, yPos + 17, { align: 'center' });
    });

    doc.setTextColor(0);
    yPos += 32;

    // ========== ACADEMICS SECTION ==========
    if (academics) {
      drawSectionHeader('ACADEMIC PROFILE', '📚');

      // GPA Card
      if (academics.gpa_weighted || academics.gpa_unweighted) {
        doc.setFillColor(...bgCard);
        doc.roundedRect(margin, yPos, contentWidth / 2 - 4, 28, 3, 3, 'F');

        doc.setFillColor(...accentColor);
        doc.roundedRect(margin, yPos, 3, 28, 1, 1, 'F');

        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...textMuted);
        doc.text('GRADE POINT AVERAGE', margin + 10, yPos + 8);

        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.setTextColor(...textDark);
        const gpaText = [];
        if (academics.gpa_unweighted) gpaText.push(`${academics.gpa_unweighted} UW`);
        if (academics.gpa_weighted) gpaText.push(`${academics.gpa_weighted} W`);
        doc.text(gpaText.join('  /  '), margin + 10, yPos + 20);
        yPos += 34;
      }

      // Test scores
      if (academics.test_scores && academics.test_scores.length > 0) {
        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TEST SCORES', margin, yPos);
        yPos += 7;

        doc.setFont('times', 'normal');
        doc.setTextColor(...textDark);
        doc.setFontSize(10);
        for (const score of academics.test_scores) {
          const testLabel = (score as any).test_name || score.type || 'Test';
          const scoreText = score.subject
            ? `${testLabel} (${score.subject}): ${score.score}`
            : `${testLabel}: ${score.score}`;
          doc.text(`- ${scoreText}`, margin + 4, yPos);
          yPos += 5;
        }
        yPos += 4;
      }

      // Courses
      if (academics.courses && academics.courses.length > 0) {
        checkNewPage(25);
        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('COURSEWORK', margin, yPos);
        yPos += 7;

        doc.setFont('times', 'normal');
        doc.setTextColor(...textDark);
        doc.setFontSize(10);
        for (const course of academics.courses) {
          const courseText = course.teacher
            ? `${course.name} — ${course.teacher}`
            : course.name;
          doc.text(`▸ ${courseText}`, margin + 4, yPos);
          yPos += 5;
        }
        yPos += 4;
      }

      // Colleges
      if (academics.colleges_applying && academics.colleges_applying.length > 0) {
        checkNewPage(20);
        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TARGET COLLEGES', margin, yPos);
        yPos += 7;

        doc.setFont('times', 'normal');
        doc.setTextColor(...textDark);
        doc.setFontSize(10);
        const collegesText = academics.colleges_applying.join('  •  ');
        const collegeLines = doc.splitTextToSize(collegesText, contentWidth - 8);
        doc.text(collegeLines, margin + 4, yPos);
        yPos += collegeLines.length * 5 + 4;
      }

      yPos += 6;
    }

    // ========== ACTIVITIES BY CATEGORY ==========
    const categoryOrder: BragCategory[] = ['leadership', 'extracurricular', 'club', 'volunteering', 'job', 'internship', 'award', 'academic', 'other'];
    const categoryIcons: Record<BragCategory, string> = {
      leadership: '👑',
      extracurricular: '⚽',
      club: '🎭',
      volunteering: '❤️',
      job: '💼',
      internship: '🎯',
      award: '🏆',
      academic: '📖',
      other: '✨',
    };

    const entriesByCategory = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<BragCategory, BragSheetEntry[]>);

    for (const category of categoryOrder) {
      const categoryEntries = entriesByCategory[category];
      if (!categoryEntries || categoryEntries.length === 0) continue;

      drawSectionHeader(categoryLabels[category].toUpperCase(), categoryIcons[category]);

      for (let entryIdx = 0; entryIdx < categoryEntries.length; entryIdx++) {
        const entry = categoryEntries[entryIdx];
        checkNewPage(45);

        // Entry card background
        doc.setFillColor(...bgLight);
        doc.roundedRect(margin, yPos - 2, contentWidth, 8, 2, 2, 'F');

        // Title with verification badge
        doc.setFontSize(11);
        doc.setFont('times', 'bold');
        doc.setTextColor(...textDark);

        let titleX = margin + 4;
        doc.text(entry.title, titleX, yPos + 4);

        if (entry.verification_status === 'verified') {
          const titleWidth = doc.getTextWidth(entry.title);
          doc.setFillColor(...accentColor);
          doc.circle(titleX + titleWidth + 6, yPos + 2, 3, 'F');
          doc.setFontSize(6);
          doc.setTextColor(255, 255, 255);
          doc.text('✓', titleX + titleWidth + 4.5, yPos + 3.5);
        }

        // Meta info badge on right
        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.setTextColor(...textMuted);
        const metaText = `${entry.grade_level} • ${entry.school_year}`;
        const metaWidth = doc.getTextWidth(metaText);
        doc.text(metaText, pageWidth - margin - metaWidth - 4, yPos + 4);
        yPos += 10;

        doc.setTextColor(...textDark);

        // Position/Role with accent
        if (entry.position_role) {
          doc.setFontSize(10);
          doc.setFont('times', 'italic');
          doc.setTextColor(...primaryColor);
          doc.text(entry.position_role, margin + 8, yPos);
          doc.setTextColor(0);
          yPos += 6;
        }

        // Grades & Hours in a compact format
        const detailParts = [];
        if (entry.grades_participated && entry.grades_participated.length > 0) {
          detailParts.push(`Grades ${entry.grades_participated.join(', ')}`);
        }
        if (entry.hours_spent) {
          detailParts.push(`${entry.hours_spent} hours`);
        }
        if (detailParts.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(...textMuted);
          doc.text(detailParts.join('  •  '), margin + 8, yPos);
          yPos += 5;
        }

        doc.setTextColor(...textDark);

        // Description
        if (entry.description) {
          doc.setFontSize(10);
          doc.setFont('times', 'normal');
          const descLines = doc.splitTextToSize(entry.description, contentWidth - 16);
          checkNewPage(descLines.length * 4 + 8);
          doc.text(descLines, margin + 8, yPos);
          yPos += descLines.length * 4 + 3;
        }

        // Impact with special styling
        if (entry.impact) {
          doc.setFillColor(236, 253, 245); // Emerald 50
          const impactLines = doc.splitTextToSize(`Impact: ${entry.impact}`, contentWidth - 20);
          const impactHeight = impactLines.length * 4 + 6;
          checkNewPage(impactHeight + 5);

          doc.roundedRect(margin + 4, yPos - 2, contentWidth - 8, impactHeight, 2, 2, 'F');
          doc.setFillColor(...accentColor);
          doc.roundedRect(margin + 4, yPos - 2, 2, impactHeight, 1, 1, 'F');

          doc.setFontSize(10);
          doc.setFont('times', 'italic');
          doc.setTextColor(...accentColor);
          doc.text(impactLines, margin + 12, yPos + 3);
          doc.setTextColor(0);
          yPos += impactHeight + 3;
        }

        // Images
        if (entry.images && entry.images.length > 0) {
          checkNewPage(45);
          const maxImages = Math.min(entry.images.length, 3);
          const imgWidth = (contentWidth - 16 - (maxImages - 1) * 4) / maxImages;
          const imgHeight = 35;

          for (let i = 0; i < maxImages; i++) {
            const imgUrl = entry.images[i];
            const img = await loadImageAsBase64(imgUrl);
            if (img) {
              const x = margin + 8 + i * (imgWidth + 4);
              try {
                doc.addImage(img.data, img.format, x, yPos, imgWidth, imgHeight, undefined, 'MEDIUM');
                doc.setDrawColor(...bgCard);
                doc.setLineWidth(0.5);
                doc.roundedRect(x, yPos, imgWidth, imgHeight, 2, 2, 'S');
              } catch (e) {
                // Skip if image can't be added
              }
            }
          }

          if (entry.images.length > 3) {
            doc.setFontSize(8);
            doc.setTextColor(...textMuted);
            doc.text(`+${entry.images.length - 3} more`, pageWidth - margin - 20, yPos + imgHeight - 2);
          }

          yPos += imgHeight + 6;
        }

        // Divider between entries (except last)
        if (entryIdx < categoryEntries.length - 1) {
          drawDivider();
        } else {
          yPos += 4;
        }
      }

      yPos += 6;
    }

    // ========== INSIGHT QUESTIONS ==========
    const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
    if (answeredInsights.length > 0) {
      drawSectionHeader('PERSONAL INSIGHTS', '💭');

      for (const question of answeredInsights) {
        const answer = getInsightAnswer(question.key);
        if (!answer) continue;

        checkNewPage(35);

        // Question with styled background
        doc.setFillColor(...bgCard);
        const qLines = doc.splitTextToSize(question.question, contentWidth - 16);
        const qHeight = qLines.length * 5 + 6;
        doc.roundedRect(margin, yPos - 2, contentWidth, qHeight, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(qLines, margin + 8, yPos + 4);
        yPos += qHeight + 4;

        // Answer
        doc.setFont('times', 'normal');
        doc.setTextColor(...textDark);
        const aLines = doc.splitTextToSize(answer, contentWidth - 12);
        checkNewPage(aLines.length * 4 + 8);
        doc.text(aLines, margin + 8, yPos);
        yPos += aLines.length * 4 + 10;
      }
    }

    // ========== FINAL FOOTER ==========
    // Drop a trailing blank page if the last checkNewPage advanced us
    // before any content was actually drawn on it.
    const lastPage = doc.internal.getNumberOfPages();
    if (lastPage > 1 && yPos <= margin + 6) {
      doc.deletePage(lastPage);
    }

    addPageFooter();

    // Add footer bar on last page
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isGenerating}
          variant="outline"
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Export Style</DialogTitle>
          <DialogDescription>
            Select how you'd like your Brag Sheet formatted
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => generatePDF('raw')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Raw Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Plain, minimal formatting. Easy to read and copy/paste. Great for quick reference.
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => generatePDF('fancy')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5" />
                Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clean, professional layout designed for teachers and counselors. Print-friendly with polished formatting.
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors border-primary/30 bg-primary/5"
            onClick={() => generatePDF('commonapp')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-5 w-5" />
                Common App Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Structured layout matching college application standards. Activities numbered, honors listed, and descriptions optimized for application review.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
