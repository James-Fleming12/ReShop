import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface resType {
    message: string,
    success: boolean,
    users: any[];
}

export const load = (async ({ cookies: Cookies }) => {
    if(!Cookies.get('jwt-token') || !Cookies.get('username')){
        redirect(307, "/");
    }
    let res: resType = {
        message: "",
        success: false,
        users: [{
            username: "",
            pfp: "",
        }],
    }
    const response = await fetch(API_URL + "/chat/" + Cookies.get("username"), {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
            token: Cookies.get("jwt-token"),
        }),
    }).catch((e) => {
        console.log(`Backend Server Error: ${e}`);
        return null;
    });
    if (!response) { res.message = "Server Error" ; return res }
    const data = await response.json().catch((e) => {
        console.log(`Client Server Error: ${e}`);
        return null;
    });
    if (!response) { res.message = "Server Error" ; return res }
    res.success = true;
    res.users = data.users;
    return res;
}) satisfies PageServerLoad;

export const actions = {
    search: async ({ request }) => {
        const res: resType = {
            message: "",
            success: false,
            users: []
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form" ; return res }
        const response = await fetch(API_URL + "/search/" + form.get("search")).catch((e) => {
            console.log(`Backend Server Error: ${e}`);
            return null;
        });
        if (!response) { res.message = "Server Error" ; return res }
        const data = await response.json().catch(() => null);
        if (!data) { res.message = "No posts" ; return res }
        res.users = data.users;
        res.success = true;
        return res;
    }
}