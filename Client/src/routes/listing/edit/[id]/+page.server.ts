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
    if(curruser !== data.listing.madeBy) { redirect(307, "/") }
    res.listing = data.listing;
    res.pictures = data.urls;
    res.success = true;
    return res;
}) satisfies PageServerLoad;

export const actions = {
    edit: async({ request, cookies: Cookies, params }) => {
        const res = {
            message: "",
            success: false,
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form Response" ; return res };
        const token = Cookies.get("jwt-token");
        const username = Cookies.get("username");
        if (!token || !username) { res.message = "Invalid Credentials" ; return res }
        form.append("token", token);
        form.append("username", username);
        const response = await fetch(API_URL + "/listing/edit/" + params.id, {
            method: "POST",
            mode: "cors",
            body: form
        }).catch((e) => {
            console.log(`Backend Server Error: ${e}`);
            return null;
        });
        if (!response) { res.message = "Invalid Server Response" ; return res }
        const data = await response.json().catch(() => null);
        if (!data) { res.message = "Invalid Server Response" ; return res }
        if (!response.ok) { res.message = data.message ; return res }
        res.message = "Changes Made";
        res.success = true;
        return res;
    },
    delete: async({ request, cookies: Cookies, params }) => {
        const res = {
            message: "",
            success: false,
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form" ; return res }
        console.log(form.get("title"));
        const response = await fetch(API_URL + "/listing/delete/" + params.id, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                token: Cookies.get("jwt-token"),
                username: Cookies.get("username"),
                postname: form.get("title"),
            }),
        }).catch((e) => {
            console.log(`Backend Server Error: ${e}`);
            return null;
        });
        if (!response) { res.message = "Invalid Response" ; return res }
        const data = await response.json().catch(() => null);
        if (!data) { res.message = "Server Error" ; return res }
        if (!response.ok) { res.message = data.message ; return res }
        redirect(303, "/profile");
    }
}