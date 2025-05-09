// src/components/layout/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore'; // Import UI store
import { Button } from '@/components/ui/button';
import { LogOut, User, Notebook, PlusCircle } from 'lucide-react'; // Import PlusCircle

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openNoteForm } = useUIStore(); // Get action to open form
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
          <Notebook className="mr-2 h-6 w-6" /> NotesApp
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing */}
          {isAuthenticated && user ? (
            <>
              {/* "Create Note" button in Navbar */}
              <Button variant="ghost" size="sm" onClick={() => openNoteForm()} className="hidden sm:inline-flex">
                <PlusCircle className="mr-2 h-4 w-4" /> New Note
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openNoteForm()} className="sm:hidden" title="New Note">
                <PlusCircle className="h-5 w-5" />
              </Button>

              <span className="text-sm hidden md:inline"> {/* Show username on medium screens and up */}
                Welcome, {user.username}!
              </span>
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} title="Dashboard">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="mr-0 sm:mr-2 h-4 w-4" /> {/* Hide text on small screens */}
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;