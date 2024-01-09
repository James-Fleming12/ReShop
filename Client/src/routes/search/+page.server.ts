import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface resType {
    message: string,
    success: boolean,
    posts: any[];
}

export const load = (async ({ }) => {
    const posts = await fetch(API_URL + "/listing/search").catch((e) => {
        console.log(`Backend Server Error : ${e}`);
        return null;
    });
    if (!posts) return redirect(307, "/");
    const data = await posts.json().catch(() => null);
    if (!data) return redirect(307, "/");
    return { listings: data.listings, time: Date.now() };
}) satisfies PageServerLoad;

export const actions = {
    default: async({ request }) => {
        const res: resType = {
            message: "",
            success: false,
            posts: []
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form" ; return res }
        const response = await fetch(API_URL + "/listing/search", {
            method: "POST",
            mode: "cors",
            body: form,
        }).catch((e) => {
            console.log(`Backend Server Error: ${e}`);
            return null;
        });
        if (!response) { res.message = "Invalid Server Response" ; return res }
        const data = await response.json().catch(() => null);
        if (!data) { res.message = "No posts" ; return res }
        res.success = true;
        res.posts = data.listings;
        return res;}
}