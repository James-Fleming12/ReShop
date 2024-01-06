import { redirect, type Cookies, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { API_URL } from '$env/static/private';

export const load = (async ({ cookies: Cookies }) => {
    if(Cookies.get("jwt-token")){
        redirect(307, "/");
    }
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, cookies: Cookies }) => {
        const formData = await request.formData();
        let res = {
            message: "",
            success: false,
        }
        if (!formData) { res.message = "Invalid Form" ; return res };
        let email = formData.get("email");
        let username = formData.get("username");
        let password = formData.get("password");
        let passcheck = formData.get("confirmation"); 
        if (!email || !username || !password || !passcheck) { res.message = "Invalid Form Information" ; return res };
        email = email.toString();
        username = username.toString();
        password = password.toString();
        passcheck = passcheck.toString();
        if (password !== passcheck) { res.message = "Passwords Don't Match" ; return res }
        
        // add length and valid email check

        const response = await fetch(API_URL + "/register", {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "email": email, 
                "username": username,
                "password": password,
            }),
        }).catch(() => null);
        if (!response) { res.message = "Invalid Server Response" ; return res };
        const data = await response.json().catch(() => null);
        if (!data) { res.message = "Invalid Server Response" ; return res };
        if (!response.ok) { res.message = data.message ; return res};
        return { message: "Account Created", success: true };
    }
}