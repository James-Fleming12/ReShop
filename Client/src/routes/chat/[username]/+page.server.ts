import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, cookies: Cookies }) => {
    if (!Cookies.get("jwt-token") || !Cookies.get("username")){
        redirect(307, "/");
    }
    const otheruser = params.username;
    let res = {
        message: "",
        success: false,
        username: Cookies.get("username"),
        messages: [{
            message: "",
            user: "",
            images: [""],
        }],
    };
    const response = await fetch(API_URL + "/chat/getuser/" + otheruser, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
            token: Cookies.get("jwt-token"),
            username: Cookies.get("username"),
            skips: 0,
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
    if (!data) { res.message = "Server Error" ; return res }
    if (!response.ok) { res.message = data.message ; return res }
    res.success = true;
    res.messages = data.messages;
    return res;
}) satisfies PageServerLoad;