// src/components/layout/Navbar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  LogOut,
  Notebook,
  PlusCircle,
  Search as SearchIcon,
  Menu, // Will be used for mobile trigger
  User as UserIcon
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openNoteForm, searchTerm, setSearchTerm } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setSearchTerm('');
    navigate('/login');
  };

  const displayMainSearchBar = isAuthenticated && location.pathname === '/';

  const getUserInitials = (name: string | undefined): string => {
    if (!name || name.trim() === '') return '??';
    const nameParts = name.trim().split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-background border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold text-primary flex items-center flex-shrink-0 mr-1 sm:mr-2"
          aria-label="NotesApp Home"
        >
          <Notebook className="mr-1 sm:mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          <span className=" xs:inline">EasyNotes</span>
        </Link>

        {/* Search Bar */}
        {displayMainSearchBar && (
          <div className="relative flex-grow  max-w-xs sm:max-w-sm md:max-w-md hidden sm:flex mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input 
              type="search"
              placeholder="Search notes..."
              className="pl-10 w-full bg-gray-50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search notes"
            />
          </div>
        )}
        
        {(!displayMainSearchBar || !isAuthenticated) && <div className="flex-grow"></div>}

        {/* Actions Menu - Right Side */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {isAuthenticated && user ? (
            <>
              {/* Desktop/Tablet "New Note" Button (visible on 'sm' and larger) */}
              <Button variant="custom" size="sm"  onClick={() => openNoteForm()} className="hidden  bg-primary sm:inline-flex  text-white">
                <PlusCircle className="mr-2 h-4 w-4 text-white" /> New Note
              </Button>

              {/* Desktop/Tablet User Menu (triggered by Avatar) */}
              <div className="hidden sm:inline-flex"> {/* This whole DropdownMenu is for sm+ */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0"> {/* Ensure no extra padding */}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture || undefined} alt={user.username || 'User Avatar'} />
                        <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Open user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-semibold text-sm focus:bg-transparent cursor-default">
                          Hi, {user.username}!
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/')}>
                          <UserIcon className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openNoteForm()}>
                          <PlusCircle className="mr-2 h-4 w-4" /> New Note
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>


              {/* Mobile Menu (triggered by Menu Icon) for screens smaller than 'sm' */}
              <div className="sm:hidden"> {/* Only show on screens smaller than 'sm' */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" /> {/* Use Menu icon for mobile trigger */}
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Display user info with avatar INSIDE the mobile dropdown */}
                    <DropdownMenuItem className="focus:bg-transparent cursor-default">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.profilePicture || undefined} alt={user.username || 'User Avatar'} />
                          <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">Hi, {user.username}!</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Optional: Search input within the mobile dropdown */}
                    {displayMainSearchBar && (
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="p-0 focus:bg-transparent">
                            <div className="relative w-full p-2">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                type="search"
                                placeholder="Search..."
                                className="pl-10 w-full text-sm h-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Search notes in menu"
                                />
                            </div>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => openNoteForm()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> New Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <UserIcon className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <> {/* Login/Signup buttons when not authenticated */} </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;