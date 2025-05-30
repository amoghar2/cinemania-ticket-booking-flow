
import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

const AuthModal = ({ isOpen, onClose, mode }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {mode === 'signin' ? (
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                footerActionLink: 'text-purple-600 hover:text-purple-700'
              }
            }}
            fallbackRedirectUrl="/"
          />
        ) : (
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                footerActionLink: 'text-purple-600 hover:text-purple-700'
              }
            }}
            fallbackRedirectUrl="/"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
