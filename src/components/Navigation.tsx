
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, User, Home, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

const Navigation = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  // Get user's first name from user metadata
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0];
  
  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CinemaBook
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button 
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/my-bookings">
                    <Button 
                      variant={location.pathname === '/my-bookings' ? 'default' : 'ghost'}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">My Bookings</span>
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 hidden sm:inline">
                      Welcome, {firstName}
                    </span>
                    <Button 
                      variant="ghost"
                      onClick={logout}
                      className="flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                  
                  <Button 
                    variant="default"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
      />
    </>
  );
};

export default Navigation;
