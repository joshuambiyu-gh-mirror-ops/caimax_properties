'use client';

import { useSession } from 'next-auth/react';
import * as actions from '@/actions';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import OnboardingModal from './ui/onboarding-modal';
import { useState, useEffect } from 'react';

export default function HeaderAuth() {
  const session = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Simulate new user detection (replace with your own logic, e.g. session.data.user.isNew)
  useEffect(() => {
    if (session.status === 'authenticated' && session.data?.user && session.data.user.isNew) {
      setShowOnboarding(true);
    }
  }, [session.status, session.data]);

  let authContent: React.ReactNode;
  if (session.status === 'loading') {
    authContent = null;
  } else if (session.data?.user) {
    authContent = (
      <Popover>
        <PopoverTrigger asChild>
          <Avatar>
            <AvatarImage src={session.data.user.image || ''} alt="User Avatar" />
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="p-4">
          <form action={actions.signOut}>
            <Button type="submit">Sign Out</Button>
          </form>
        </PopoverContent>
      </Popover>
    );
  } else {
    authContent = (
      <div className="flex gap-2">
        <form action={actions.signIn}>
          <Button type="submit" variant="outline" className="text-sm px-2 py-1 sm:text-base sm:px-3 sm:py-2 btn-glow relative-z-30">Sign In</Button>
        </form>
        <form action={actions.signIn}>
          <Button type="submit" variant="default" className="text-sm px-2 py-1 sm:text-base sm:px-3 sm:py-2 btn-glow relative-z-50">Sign Up</Button>
        </form>
      </div>
    );
  }

  return (
    <>
      {authContent}
      {showOnboarding && (
        <OnboardingModal onComplete={(propertyTypes) => {
          // TODO: Save propertyTypes for user, then close modal
          setShowOnboarding(false);
        }} />
      )}
    </>
  );
}
