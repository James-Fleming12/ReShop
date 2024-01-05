import type { APIRoute } from 'astro';

export const POST: APIRoute = async({ request, redirect }) => {
    const formData = await request.formData();
    if (!formData) return new Response (JSON.stringify({ message: "Invalid Form" }), { status: 400 });
    let email = formData.get("email");
    let username = formData.get("username");
    let password = formData.get("password");
    let passcheck = formData.get("confirmation");
    if(!email) return new Response (JSON.stringify({ message: "Email is required" }), { status: 400 });
    if(!username)return new Response (JSON.stringify({ message: "Username is required" }), { status: 400 });
    if(!password) return new Response (JSON.stringify({ message: "Password is required" }), { status: 400 });
    if(!passcheck) return new Response (JSON.stringify({ message: "Password confirmation is required" }), { status: 400 });
    email = email.toString();
    username = username.toString();
    password = password.toString();
    passcheck = passcheck.toString();
    const regx: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!regx.test(email)) return new Response(JSON.stringify({ message: "Invalid Email" }), { status: 400 });
    if(password !== passcheck) return new Response(JSON.stringify({ message: "Passwords do not match" }), { status: 400 });
    try { // calling backend API, creating user (if a return is sent not within the 200 range, the user already was created)
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email, 
                username: username,
                password: password,
            }),
        }); 
        if(!response){
            return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
        }
        if(!response.ok){ // any error happened in the server
            const resBody = await response.json();
            return new Response(JSON.stringify({ message: resBody.message }), { status: 409 });
        }
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
    }
    return redirect("/signin");
};