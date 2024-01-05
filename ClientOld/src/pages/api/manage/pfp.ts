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
    if (!formData) return new Response(JSON.stringify({ message: "Invalid Form Data" }), { status: 409 });
    if (!cookies.get("username")) return new Response(JSON.stringify({ message: "Invalid Information" }), { status: 409 });

    // might want to send the token too to add extra security to the Profile Picture
    const response = await fetch("http://localhost:5000/user/pfp/" + cookies.get("username")!.value, {
        method: "POST",
        mode: "cors",
        body: formData
    }).catch(() => null);

    if (!response) return new Response(JSON.stringify({ message: "Invalid Server Response" }), { status: 404 });
    if (!response.ok) {
        const data = await response.json().catch(() => { message: "Error" });
        return new Response(JSON.stringify({ message: data.message }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Profile Picture Changed" }), { status: 200 });
};