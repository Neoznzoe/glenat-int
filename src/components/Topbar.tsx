import { Search, Bell, User, ChevronDown, ShoppingBag } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      {/* Barre de recherche */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 bg-muted border-input focus:bg-background"
          />
        </div>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#ff3b30] rounded-full"></span>
        </Button>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Profil utilisateur */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-foreground">John Doe</div>
              <div className="text-xs text-muted-foreground">Administrateur</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}