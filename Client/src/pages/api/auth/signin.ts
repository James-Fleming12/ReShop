import { type APIRoute } from 'astro';

export const POST: APIRoute = async({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    console.log(formData);
    if(!email || !password) {
        return new Response("Email and password are required", { status: 400 });
    }

    try {
        const response = await fetch("http://localhost:5000/signin", {
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
        });

        if(response.ok){
            const jsonRes = await response.json();
            const token = jsonRes.token;
            cookies.set("jwt-token", token, {
                path: "/",
                secure: true,
                sameSite: "strict",
            });
        }else{
            return new Response("Invalid Credential", { status: 400 });
        }

    } catch (e) {
        return new Response("Server Down", { status: 500 });
    }

    return redirect('/');
};