import type { APIRoute } from 'astro';

// Function for handling bio, real name, and pfp changes
// redirects it to the specified API route
export const POST: APIRoute = async({ request, cookies }) => { 
    let formData;
    try{
        formData = await request.formData();
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ message: "Form Failed" }), { status: 409 });
    }
    if (!formData) return new Response(JSON.stringify({ message: "Server Error" }), { status: 404 });
    let bio = formData.get("bio");
    let name = formData.get("name");
    let token = cookies.get("jwt-token");
    if (bio && bio.toString().length > 200) return new Response(JSON.stringify({ message: "Invalid Bio Length" }), { status: 409 });
    if (name && name.toString().length > 50) return new Response(JSON.stringify({ message: "Invalid Name Length" }), { status: 409 });
    if (!token) return new Response(JSON.stringify({ message: "Invalid Credentials" }), { status: 409 });
    if (!cookies.get("username")) return new Response(JSON.stringify({ message: "Invalid Cookie" }), { status: 409 });
    try {
        const response = await fetch(import.meta.env.API_URL + "/user/changeinfo/" + cookies.get("username")!.value, {
            method: "POST",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "bio": bio, 
                "name": name,
                "token": token.value,
            }),
        });
        if(!response.ok){
            const responseData = await response.json();
            return new Response(JSON.stringify({ message: responseData.message }), { status: 400 });
        }
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ message: "Server Down" }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: "Profile Information Updated" }), { status: 200 });
};