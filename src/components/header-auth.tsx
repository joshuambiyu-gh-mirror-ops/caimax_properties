'use client';

import { useSession } from 'next-auth/react';
import * as actions from '@/actions';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

export default function HeaderAuth() {
  const session = useSession();

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
          <form action={actions.signOut} method="post">
            <Button type="submit">Sign Out</Button>
          </form>
        </PopoverContent>
      </Popover>
    );
  } else {
    authContent = (
      <div className="flex gap-2">
        <form action={actions.signIn}>
          <Button type="submit" variant="outline">Sign In</Button>
        </form>
        <form action={actions.signIn}>
          <Button type="submit" variant="default">Sign Up</Button>
        </form>
      </div>
    );
  }

  return authContent;
}
