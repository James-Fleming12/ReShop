import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ request, cookies: Cookies, params }) => {
    const res = {
        message: "",
        success: false,
        listing: {
            title: "",
            bio: "",
            value: 0,
            created: undefined,
        },
        pictures: [""],
    }
    const curruser = Cookies.get("username");
    if (!curruser) { redirect(307, "/") }
    const response = await fetch(API_URL + "/listing/get/" + params.id).catch(() => null);
    if (!response || !response.ok) { res.message = "Server Error" ; return res }
    const data = await response.json().catch(() => null);
    if (!data) { res.message = "Server Error" ; return res }
    if(curruser !== data.madeBy) { redirect(307, "/") }
    res.listing = data.listing;
    res.pictures = data.urls;
    res.success = true;
    return res;
}) satisfies PageServerLoad;

export const actions = {
    edit: async({ request, cookies: Cookies }) => {
        const res = {
            message: "",
            success: false,
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form Response" ; return res };

        // handle changing the information

        res.message = "Changes Made";
        res.success = true;
        return res;
    },
    delete: async({ request, cookies: Cookies }) => {
        const res = {
            message: "",
            success: false,
        }

        // API request

        res.message = "Listing Deleted";
        res.success = true;
        return res;
    }
}