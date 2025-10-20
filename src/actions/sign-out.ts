'use server'
import { redirect } from 'next/navigation';

export async function signOut(callbackUrl?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/auth/signout${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
  redirect(url);
}
