import {
  Search,
  Bell,
  User,
  ChevronDown,
  ShoppingBag,
  Settings,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { useAppSelector } from '@/hooks/redux';
import CartSummary from './CartSummary';
import { useState } from 'react';
import { useAccount, useMsal } from '@azure/msal-react';
import NotificationList from './NotificationList';
import { msalConfig } from '@/lib/msal';

export function Topbar() {
  const { instance, accounts } = useMsal();
  const primaryAccount = instance.getActiveAccount() ?? accounts[0] ?? null;
  const account = useAccount(primaryAccount);
  const itemCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const notifications = [
    {
      count: 2,
      label: "Demande d'investissement informatique et téléphonie à traiter",
    },
    {
      count: 24,
      label: "Demande d'intervention informatique à traiter",
    },
    {
      count: 10,
      label: "Demande d'installation nouvel entrant à traiter",
    },
  ];
  const notificationCount = notifications.reduce((sum, n) => sum + n.count, 0);
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [searchScope, setSearchScope] = useState('catalogue');
  const scopeLabels = {
    catalogue: 'Catalogue',
    glenatdoc: "Glénat'doc",
    'qui-fait-quoi': 'Qui fait quoi',
  } as const;

  // Prevent the hover card from briefly closing when interacting with the
  // quantity selector inside the cart summary. If the select dropdown is open,
  // ignore close events coming from the hover card.
  const handleHoverOpenChange = (next: boolean) => {
    if (!next && selectOpen) return;
    setOpen(next);
  };

  const handleLogout = () => {
    void instance.logoutRedirect({
      account: primaryAccount ?? undefined,
      postLogoutRedirectUri:
        msalConfig.auth.postLogoutRedirectUri ??
        (typeof window !== 'undefined' ? window.location.origin : undefined),
    });
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      {/* Barre de recherche */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Rechercher dans ${scopeLabels[searchScope]}`}
              className="pl-10 pr-36 bg-muted border-input focus:bg-background"
            />
            <Select value={searchScope} onValueChange={setSearchScope}>
              <SelectTrigger className="absolute top-0 right-0 h-full w-36 border-l border-input bg-muted pr-8 pl-2 text-sm focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="catalogue">Catalogue</SelectItem>
                <SelectItem value="glenatdoc">Glénat'doc</SelectItem>
                <SelectItem value="qui-fait-quoi">Qui fait quoi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        {/* Notifications */}
        <HoverCard openDelay={0} closeDelay={150}>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-0" align="end">
            <NotificationList notifications={notifications} />
          </HoverCardContent>
        </HoverCard>
        <HoverCard
          open={open || selectOpen}
          onOpenChange={handleHoverOpenChange}
          openDelay={0}
          closeDelay={150}
        >
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-[28rem] p-0" align="end">
            <CartSummary onSelectOpenChange={setSelectOpen} />
          </HoverCardContent>
        </HoverCard>

        {/* Profil utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 my-1 flex items-center space-x-2 focus-visible:ring-0 h-auto py-1.5"
            >
              <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-foreground">
                  {account?.name ?? ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  {account?.username ?? ''}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Contrôle mot de passe</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
