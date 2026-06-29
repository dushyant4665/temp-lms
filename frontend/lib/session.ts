import { cookies } from 'next/headers';

export async function getCookieHeader() {
  return (await cookies()).toString();
}

export async function hasDashboardSession() {
  return (await cookies()).has('tt_session');
}
