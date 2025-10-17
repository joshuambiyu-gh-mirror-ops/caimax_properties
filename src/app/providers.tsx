'use client';
import { SessionProvider } from "next-auth/react";
import { useSession } from 'next-auth/react';
import GoogleOneTap from '@/components/GoogleOneTap';

interface ProviderProps{
    children: React.ReactNode;
}
export default function Providers({children}:ProviderProps){
    // Render One Tap for unauthenticated users (client-side only)
    return(
        <SessionProvider>
            <InnerProviders>
                {children}
            </InnerProviders>
        </SessionProvider>
    );
}

function InnerProviders({ children }:{children:React.ReactNode}){
    const { status } = useSession();

    return (
        <>
            {status !== 'authenticated' && <GoogleOneTap />}
            {children}
        </>
    );
}

