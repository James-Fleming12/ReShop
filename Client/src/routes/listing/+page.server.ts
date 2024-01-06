import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies: Cookies }) => {
    if(!Cookies.get('jwt-token')){
        redirect(307, "/");
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async({ request, cookies: Cookies }) => {
        let res = {
            message: "",
            success: false,
            url: "",
        };
        let formData = await request.formData().catch(() => null);
        if (!formData) { res.message = "Invalid Form" ; return res };
        const username = Cookies.get("username");
        const token = Cookies.get("jwt-token");
        if (!username || !token) { res.message = "Invalid Tokens" ; return res};
        formData.append("token", token);
        const response = await fetch(API_URL + "/listing/create/" + username, {
            method: "POST",
            mode: "cors",
            body: formData
        }).catch(() => null);
        if (!response) { res.message = "Server Error" ; return res };
        const data = await response.json().catch(() => null);
        if (!data) { res.message = "Server Error" ; return res};
        if (!response.ok) { res.message = data.message ; return res};
        res.url = "/listing/" + data.id;
        res.success = true;
        res.message = "Post Created";
        return res;
    }
}