// src/components/layout/Navbar.tsx
// The new NavBar With Create Note Button
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input"; // For Search

import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore"; // Import UI store
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  Notebook,
  PlusCircle,
  Search as SearchIcon,
} from "lucide-react"; // Import PlusCircle

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openNoteForm, searchTerm, setSearchTerm } = useUIStore(); // Get action to open form
  const navigate = useNavigate();
  const location = useLocation(); // To know if we are on the dashboard page

  const handleLogout = () => {
    logout();
    setSearchTerm(""); // Clear search term on logout

    navigate("/login");
  };
  const showSearchBar = isAuthenticated && location.pathname === "/";

  return (
    <nav className="bg-background border-b fixed top-0 left-0 right-0 z-50">
      <div className="container  mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex-grow flex items-center  max-sm:items-center  space-x-10 ">
          <Link
            to="/"
            className="text-2xl font-bold text-primary flex items-center"
          >
            <Notebook className="mr-2 h-6 w-6" /> NotesApp
          </Link>
          {showSearchBar && (
            <div className="relative flex-grow max-w-xs sm:max-w-sm md:max-w-md pr-10  max-sm:pr-0 mx-auto">
              {" "}
              {/* Adjusted width and centering */}
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search notes"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between space-x-2  sm:space-x-2">
          {" "}
          {/* Adjusted spacing */}
          {isAuthenticated && user ? (
            <>
              {/* "Create Note" button in Navbar */}
              {/* Search Bar - Conditionally Rendered */}

              <span className="text-sm hidden md:inline">
                {" "}
                {/* Show username on medium screens and up */}
                Welcome, {user.username}!
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                title="Dashboard"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="custom"
                size="sm"
                onClick={() => openNoteForm()}
                className="hidden text-primary sm:inline-flex"
              >
                <PlusCircle className="mr-2 text-amber-500 h-4 w-4" /> New Note
              </Button>
              <Button
                variant="custom"
                size="icon"
                onClick={() => openNoteForm()}
                className="sm:hidden"
                title="New Note"
              >
                <PlusCircle className="h-5 w-5 text-amber-500" />
              </Button>
              <Button variant="destructive" onClick={handleLogout} size="sm">
                <LogOut className="mr-0 sm:mr-2 h-4 w-4" />{" "}
                {/* Hide text on small screens */}
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
