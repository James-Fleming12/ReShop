import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const response = await fetch(API_URL).catch(() => null);
    if (!response) return { message: "Server Error" };
    const data = await response.json().catch(() => null);
    if (!data) return { message: "Server Error" };
    return { message: data.message };
}) satisfies PageServerLoad;