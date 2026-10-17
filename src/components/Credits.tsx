import { Code, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Credits() {
  return (
    <div className="card-elevated p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Code className="h-4 w-4 text-muted-foreground" />
        <div className="text-sm">
          <span className="text-muted-foreground">Made by </span>
          <span className="font-semibold text-foreground">Ramakrishna Krishna</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/about" className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            About LunchLit
          </Link>
        </Button>
      </div>
    </div>);
}
