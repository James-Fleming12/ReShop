import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies: Cookies }) => {
    Cookies.delete("jwt-token", { path: "/" });
    Cookies.delete("username", { path: "/" });
    return redirect(307, "/");
}) satisfies PageServerLoad;