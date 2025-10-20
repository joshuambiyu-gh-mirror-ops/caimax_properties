'use client';

interface ProviderProps{
    children: React.ReactNode;
}

export default function Providers({children}:ProviderProps){
    // Auth is disabled - no providers needed
    return children;
}

