import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Key, Check, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredGeminiKey, setStoredGeminiKey } from '@/lib/aiService';

export function AiSettingsCard() {
  const [apiKey, setApiKey] = useState('');
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const existing = getStoredGeminiKey();
    if (existing) {
      setApiKey(existing);
      setHasSavedKey(true);
    }
  }, []);

  const handleSave = () => {
    setStoredGeminiKey(apiKey);
    if (apiKey.trim()) {
      setHasSavedKey(true);
      toast.success('Custom Google Gemini API key saved!');
    } else {
      setHasSavedKey(false);
      toast.info('Cleared custom API key. Using built-in resilient AI engine.');
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Study Buddy &amp; Smart Tools
          </CardTitle>
          <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-3 h-3" /> Resilient Dual-Engine
          </Badge>
        </div>
        <CardDescription>
          LunchLit provides zero-downtime AI study tutoring, workout generation, gym machine scanning, and scholarship matching.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-xl bg-secondary/40 border border-border/80 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Smart Offline &amp; Hybrid Architecture Active
          </div>
          <p>
            If cloud functions are unreachable or rate-limited, our built-in pedagogical study and workout engine instantly takes over so your homework flow is never interrupted.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-primary" />
            Optional: Personal Google Gemini API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="AIzaSy... (leave blank to use built-in engine)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="text-xs font-mono h-9"
            />
            <Button size="sm" onClick={handleSave} className="h-9 px-3 gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Get a free Gemini API key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-primary underline hover:opacity-80">Google AI Studio</a>. Completely optional!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

