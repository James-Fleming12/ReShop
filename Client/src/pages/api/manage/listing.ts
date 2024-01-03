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
    if (!cookies.get("jwt-token") || !cookies.get("username")) return new Response(JSON.stringify({ message: "Invalid Information" }), { status: 409 });
    
    
};