import type { APIRoute } from 'astro';

// Function for handling bio, real name, and pfp changes
// redirects it to the specified API route
export const POST: APIRoute = async({ request  }) => { 
    
    return new Response(JSON.stringify({ message: "Profile Information Changed" }), { status: 200 });
};