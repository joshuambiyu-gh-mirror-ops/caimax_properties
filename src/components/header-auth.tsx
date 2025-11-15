
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
            {/* compact on xs, full label on sm+ */}
            <MagicButton title="Sign in" compact otherClasses="sm:w-40" />
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

  const name = session.user?.name || session.user?.email || '';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Open user menu"
          className="inline-flex items-center justify-center h-9 w-9 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100"
        >
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-gray-800">{initials}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-800 font-medium truncate">{session.user?.name}</div>
          <div className="text-xs text-gray-500 truncate">{session.user?.email}</div>
          <div className="pt-2">
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
