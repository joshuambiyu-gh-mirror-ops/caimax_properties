'use server'
import { redirect } from 'next/navigation';
import { signOut as signOutUrl } from '@/auth';

export async function signOut(formData?: FormData) {
    const url = signOutUrl();
    redirect(url);
}
