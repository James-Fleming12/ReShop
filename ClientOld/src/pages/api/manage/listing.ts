import type { APIRoute } from 'astro';

// Function for handling bio, real name, and pfp changes
// redirects it to the specified API route
export const POST: APIRoute = async({ request, cookies, redirect }) => { 
    let formData;
    try{
        formData = await request.formData();
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ message: "Form Failed" }), { status: 409 });
    }
    if (!formData) return new Response(JSON.stringify({ message: "Invalid Form Data" }), { status: 409 });
    if (!cookies.get("jwt-token") || !cookies.get("username")) return new Response(JSON.stringify({ message: "Invalid Information" }), { status: 409 });
    
    formData.append("token", cookies.get("jwt-token")!.value);

    const response = await fetch(import.meta.env.API_URL + "/listing/create/" + cookies.get("username")!.value, {
        method: "POST",
        mode: "cors",
        body: formData
    }).catch(() => null);
    console.log(response);

    if (!response) return new Response(JSON.stringify({ message: "Invalid Server Response" }), { status: 404 });
    const data = await response.json().catch(() => { message: "Error" });
    if (!response.ok) {
        return new Response(JSON.stringify({ message: data.message }), { status: 404 });
    }
    console.log("/listing/" + data.id);
    return new Response(JSON.stringify({ url: "/listing/" + data.id }));
};