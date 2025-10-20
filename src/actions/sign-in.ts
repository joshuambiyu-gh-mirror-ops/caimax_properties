'use server'
import { redirect } from 'next/navigation';

export async function signIn(provider: string, formData?: FormData, callbackUrl?: string) {
  // If callbackUrl is not provided, use default
  const finalCallbackUrl = callbackUrl || '/';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/auth/signin/${provider}${finalCallbackUrl ? `?callbackUrl=${encodeURIComponent(finalCallbackUrl)}` : ''}`;
  redirect(url);
}

