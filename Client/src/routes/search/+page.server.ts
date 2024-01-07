import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async ({ }) => {
    return { time: Date.now() };
}) satisfies PageServerLoad;

export const actions = {
    default: async({ request }) => {
        const res = {
            message: "",
            posts: []
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form" ; return res }
    }
}