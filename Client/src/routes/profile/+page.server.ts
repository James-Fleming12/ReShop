import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies: Cookies }) => {
    if(!Cookies.get('jwt-token')){
        redirect(307, "/");
    }
    const username = Cookies.get("username");
    if (!username) redirect(307, "/");
    const response = await fetch(API_URL + "/user/get/" + username).catch((e) => {
        console.log(`Server Error Fetching User Information: ${e}`);
        return null;
    });
    if (!response || !response.ok) return { message: "Server Error" };
    const data = await response.json().catch((e) => {
        console.log(`Server Error: ${e}`);
        return null;
    });
    if (!data) return { message: "Server Error" };
    const imageRes = await fetch(API_URL + "/user/pfp/" + username).catch((e) => {
        console.log(`Server Error Fetching Profile Picture: ${e}`);
        return null;
    });
    if (!imageRes) return { message: "Server Error" };
    const data2 = await imageRes.json().catch((e) => {
        console.log(`Server Error: ${e}`);
        return null;
    });
    if (!data2) return { message: "Server Error" };
    if (!response.ok) return { message: data2.message };
    const postsRes = await fetch(API_URL + "/listing/getuser/" + username).catch((e) => {
        console.log(`Server Error Fetching User's Posts: ${e}`);
        return null;
    });
    if (!postsRes || !postsRes.ok) return { message: "Server Error" };
    const postdata = await postsRes.json().catch(() => null);
    if (!postdata) return { message: "Invalid Server Response Fetching Posts" };
    return { 
        username: username,
        name: data.user.name,
        bio: data.user.bio,
        source: data2.url,
        posts: postdata.posts,
    };
}) satisfies PageServerLoad;

export const actions = {
    changeInfo: async({ request, cookies: Cookies }) => {
        const res = {
            message: "",
            success: false,
            info: true,
        }
        const form = await request.formData().catch(() => null);
        if (!form) { res.message = "Invalid Form" ; return res };
        const bio = form.get("bio");
        const name = form.get("name");
        const token = Cookies.get("jwt-token");
        const username = Cookies.get("username");
        if (!token || !username) { res.message = "Invalid Token" ; return res };
        if (!bio && !name) { res.message = "No Changes to be Made" ; return res };
        const response = await fetch(API_URL + "/user/changeinfo/" + username, {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "bio": bio, 
                "name": name,
                "token": token,
            }),
        }).catch(() => null);
        if (!response || !response.ok) { res.message="Invalid Server Response" ; return res };
        res.message = "Profile Information Changed";
        res.success = true;
        return res;
    },
    changePfp: async({ request, cookies: Cookies }) => {
        const res = {
            message: "",
            success: false,
            info: false,
        }
        const username = Cookies.get("username");
        const token = Cookies.get("jwt-token");
        if (!username || !token) { res.message="Invalid Tokens" ; return res};
        let formData = await request.formData().catch(() => null);
        if (!formData) { res.message="Invalid Form" ; return res};
        formData.append("token", token);
        const response = await fetch(API_URL + "/user/pfp/" + username, {
            method: "POST",
            mode: "cors",
            body: formData,
        }).catch(() => null);
        if (!response) { res.message="Server Error" ; return res };
        const data = await response.json().catch(() => null);
        if (!data) { res.message="Server Error" ; return res };
        if (!response.ok) { res.message=data.message ; return res};
        res.message = "Profile Picture Updated";
        res.success = true;
        return res; 
    }
}