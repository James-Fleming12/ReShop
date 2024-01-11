import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies: Cookies }) => {
    if (!Cookies.get("jwt-token")){
        redirect(307, "/");
    }
    let res = {
        message: "",
        success: false,
        messages: [{
            message: "",
            user: "",
        }],
    };

    

    return res;
}) satisfies PageServerLoad;