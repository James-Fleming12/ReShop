import { API_URL } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies: Cookies }) => {
    let logged: boolean = false;
    const token = Cookies.get("jwt-token");
    const check = Cookies.get("username");
    if(token && check){
        logged = true;
    } else if (token){
        const response = await fetch(API_URL + "/validate", {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
            }),
        }).catch(() => null);
        if (response && response.ok){
            const data = await response.json().catch(() => null);
            Cookies.set("username", data.user, { path: "/" });
            logged = true;
        }
    }
    if(logged){
        return { 
            urls: [
                ["/", "Home"],
                ["/profile", "Profile"],
                ["/listing", "Create Listing"],
            ],
            logged: logged,
        };
    }else{
        return { 
            urls: [
                ["/", "Home"],
                ["/auth/login", "Sign In"],
            ],
            logged: logged,
        };
    }
}) satisfies LayoutServerLoad;