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
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "token": Cookies.get("jwt-token"),
            "username": Cookies.get("username"),
            "skips": 0,
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

export const actions =  {
    send: async ({ request, cookies: Cookies, params }) => {
        console.log("called");
        const res = {
            message: "",
            success: false,
            sent: {
                message: "",
                user: "", 
                images: [""],
            }
        }
        const token = Cookies.get("jwt-token");
        const username = Cookies.get("username");
        const otheruser = params.username;
        const formData = await request.formData().catch((e) => { console.log(`Client Server Error: ${e}`) ; return null; });
        if (!formData) { res.message = "Client Error" ; return res }
        if (!token || !username) { res.message = "Invalid Validation" ; return res }
        formData.append("token", token);
        formData.append("username", username);
        formData.append("send", otheruser);
        const response = await fetch(API_URL + "/chat/send", {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formData,
        }).catch((e) => {
            console.log(`Backend Server Error: ${e}`);
            return null;
        });
        if (!response) { res.message = "Server Error" ; return res }
        const data = await response.json().catch((e) => { console.log(`Client Server Error: ${e}`) ; return null });
        if (!data) { res.message = "Server Error" ; return res }
        if (!response.ok) { res.message = data.message ; return res }
        res.sent = data.sentmessage;
        res.success = true;
        return res;
    },
    edit: async ({ request }) => {

    },
    delete: async ({ request }) => {

    }
}