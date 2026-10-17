import { Shield, ArrowLeft, Mail, Github, MessageSquare, Lock, Eye, Trash2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - LunchLit</title>
        <meta name="description" content="Privacy Policy for LunchLit - Learn how we collect, protect, and handle your data." />
      </Helmet>

      <div className="container py-8 max-w-3xl mx-auto space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">Last updated: October 17, 2026</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            LunchLIT is committed to transparency, student data privacy, and giving you full ownership over your information.
          </p>
        </div>

        {/* Intro Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background">
          <CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed">
            <p>
              LunchLIT ("we", "our", or "us") operates the LunchLIT mobile application and web platform. This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </CardContent>
        </Card>

        {/* 1. Information Collection and Use */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              1. Information Collection and Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              We collect several different types of information for various purposes to provide and improve our service to you.
            </p>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                <p className="font-semibold text-foreground mb-1">Account & Profile Information</p>
                <p>If you create an account, we collect user credentials (such as email and authentication data managed securely via Supabase) to sync your schedule, tasks, and notes across devices.</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                <p className="font-semibold text-foreground mb-1">Academic & Productivity Data</p>
                <p>Information you input voluntarily, such as class schedules, assignments, study timers, and brag sheet entries.</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                <p className="font-semibold text-foreground mb-1">Device & Usage Data</p>
                <p>Basic diagnostic data and app performance metrics to ensure stability and smooth user experience.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Use of Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              2. Use of Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>LunchLIT uses the collected data for various purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide and maintain the LunchLIT service.</li>
              <li>To allow you to participate in interactive features of our app (such as study timers, wellness check-ins, and peer discussion).</li>
              <li>To provide customer support and improve our student productivity tools.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. Third-Party Services & SDKs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              3. Third-Party Services & SDKs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              LunchLIT utilizes secure third-party backend services (such as Supabase for database management and authentication). We do <strong className="text-foreground">not</strong> sell, rent, or trade your personal or sensitive user data to any third parties or advertisers.
            </p>
          </CardContent>
        </Card>

        {/* 4. Security of Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              4. Security of Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              The security of your data is important to us. We use modern cryptographic protocols (such as HTTPS encryption in transit and row-level security policies) to protect data sent to and from our servers. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </CardContent>
        </Card>

        {/* 5. Your Rights & Account Deletion */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Trash2 className="w-5 h-5 text-amber-500" />
              5. Your Data Protection Rights & Account Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>You have full control over your data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Access & Correction:</strong> You can update your profile and schedule details directly within the app anytime.
              </li>
              <li>
                <strong className="text-foreground">Account Deletion:</strong> If you wish to delete your account and all associated data, you can do so directly from within the app settings, or by visiting our account deletion web resource. Upon request, all associated user data will be permanently and irreversibly deleted.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 6. Children's Privacy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">6. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              LunchLIT is designed as a student productivity tool for high school students. We do not knowingly collect personally identifiable information from children under 13 without appropriate parental consent.
            </p>
          </CardContent>
        </Card>

        {/* 7. Changes to This Privacy Policy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">7. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated "Last updated" date.
            </p>
          </CardContent>
        </Card>

        {/* 8. Contact Us */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">8. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              If you have any questions, feedback, or account deletion requests regarding this Privacy Policy, please contact us through any of the following channels:
            </p>
            <div className="space-y-2 pt-2">
              <a
                href="mailto:kutturam0912@gmail.com"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>kutturam0912@gmail.com</span>
              </a>
              <a
                href="https://github.com/RayStudios57/LunchLit-Official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground font-medium transition-colors"
              >
                <Github className="w-4 h-4 text-primary shrink-0" />
                <span>github.com/RayStudios57/LunchLit-Official</span>
              </a>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/60 text-foreground font-medium">
                <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                <span>Discord: Join our official community server via Discord</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Back Button */}
        <div className="flex justify-center pt-4 pb-8">
          <Button asChild size="lg">
            <Link to="/">Back to LunchLit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
