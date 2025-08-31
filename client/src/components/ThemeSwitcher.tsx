import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const schemes: { id: any; label: string; sample: string }[] = [
  { id: 'emerald', label: 'Emerald', sample: 'bg-emerald-500' },
  { id: 'blue', label: 'Blue', sample: 'bg-blue-500' },
  { id: 'violet', label: 'Violet', sample: 'bg-violet-500' },
  { id: 'rose', label: 'Rose', sample: 'bg-rose-500' },
];

export function ThemeSwitcher() {
  const { mode, toggleTheme, colorScheme, setColorScheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={toggleTheme}>
          {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="outline" onClick={() => setOpen(o => !o)} className="text-xs">
          {colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)}
        </Button>
      </div>
      {open && (
        <div className="absolute z-50 mt-2 w-40 rounded-md border bg-popover p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            {schemes.map(s => (
              <button
                key={s.id}
                onClick={() => { setColorScheme(s.id); setOpen(false); }}
                className={cn('flex flex-col items-center gap-1 rounded-md border p-2 hover:bg-accent transition text-[10px] focus:outline-none',
                  colorScheme === s.id && 'ring-2 ring-primary')}
              >
                <span className={cn('h-5 w-5 rounded-full', s.sample)} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
