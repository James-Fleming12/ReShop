import { redirect, type Cookies, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { API_URL } from '$env/static/private';

export const load = (async ({ cookies: Cookies }) => {
    if(Cookies.get("jwt-token")){
        redirect(307, "/");
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData().catch(() => null);
        if (!formData) return fail(400, { message: "Invalid Form Response", success: false });
        let email = formData.get('email');
        let password = formData.get('password');
        if (!email) return fail(400, { message: "Email Required", success: false });
        if (!password) return fail(400, { message: "Password Required", success: false });
        email = email.toString();
        password = password.toString();
        if (email.length > 30 || email.length < 5) return fail(400, { message: "Invalid Email Length", success: false });
        if (password.length > 50 || password.length < 5) return fail(400, { message: "Invalid Password Length", success: false });
        
        // add valid email check

        const response = await fetch(API_URL + "/signin", {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "email": email, 
                "password": password,
            }),
        }).catch(() => null);
        if (!response) return fail(404, { message: "Invalid Server Response", success: false });
        const body = await response.json().catch(() => null);
        if (!body) return fail(404, { message: "Server Error", success: false });
        if (!response.ok) return fail(404, { message: body.message, success: false });
        cookies.set("jwt-token", body.token, { path: "/", httpOnly: true, sameSite: "strict", maxAge: 36000 });
        return { message: "Logged In", success: true };
    }
}