import type { APIRoute } from 'astro';

export const POST: APIRoute = async({ request, redirect }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const passcheck = formData.get("confirmation")?.toString();

    if(!email) return new Response ("Email is required", { status: 400 });
    if(!username)return new Response ("Username is required", { status: 400 });
    if(!password) return new Response ("Password is required", { status: 400 });
    if(!passcheck) return new Response ("Password confirmation is required", { status: 400 });
    if(password !== passcheck) return new Response("Passwords do not match", { status: 400 });
    try {
        console.log("response called");
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
        console.log("response received");
        if(!response){
            return new Response("Server Error", { status: 500 });
        }
        console.log("response is there");
    } catch (e) {
        console.log(e);
        return new Response("Server Error", { status: 500 });
    }
    console.log("redirect happening");
    return redirect("/signin");
};