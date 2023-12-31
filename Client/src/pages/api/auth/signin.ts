import { type APIRoute } from 'astro';

export const POST: APIRoute = async({ request, cookies, redirect }) => {
    let formData;
    try{
        formData = await request.formData();
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ message: "Form Failed" }), { status: 409 });
    }
    let email = formData.get("email");
    let password = formData.get("password");
    
    const regx: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!email || !password) {
        return new Response(JSON.stringify({ message: "Email and password are required" }), { status: 409 });
    }
    
    email = email.toString();
    password = password.toString();

    if(!regx.test(email)) return new Response(JSON.stringify({ message: "Invalid Email" }), { status: 409 });
    if(email.length > 50) return new Response(JSON.stringify({ message: "Email too long" }), { status: 409 });
    if(password.length > 50) return new Response(JSON.stringify({ message: "Password too long" }), { status: 409 });

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
            console.log("breaks here");
            const jsonRes = await response.json();
            const token = jsonRes.token;
            cookies.set("jwt-token", token, {
                path: "/",
                secure: true,
                sameSite: "strict",
                maxAge: 1200000,
            });
        }else{
            return new Response(JSON.stringify({ message: "Invalid Credential" }), { status: 400 });
        }
    } catch (e) {
        return new Response(JSON.stringify({ message: "Server Down" }), { status: 500 });
    }
    return redirect("/");
};