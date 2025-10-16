'use server'
import { redirect } from 'next/navigation';
import { signIn as signInUrl } from '@/auth';

export async function signIn(formData?: FormData) {
    // Optional: read form data if needed
    const url = signInUrl('google');
    redirect(url);
}

