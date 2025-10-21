
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { MagicButton } from './ui/magic-button';

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (!session) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <MagicButton title="Sign in" otherClasses="w-40" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold mb-2">Continue with</h2>
          <MagicButton
            title="GitHub"
            handleClick={() => signIn('github')}
            otherClasses="w-40"
          />
          <MagicButton
            title="Google"
            handleClick={() => signIn('google')}
            otherClasses="w-40"
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-700">Signed in as {session.user?.name || session.user?.email}</span>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition"
      >
        Sign out
      </button>
    </div>
  );
}
