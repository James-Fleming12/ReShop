import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const response = await fetch("http://localhost:5000/validate", {
        method: "POST",
        mode: "cors",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: cookies.get("jwt-token"),
        }),
    });
    if(!response || !response.ok){
        return redirect("/signin");
    }
    const jsonRes = await response.json();
    cookies.set("username", jsonRes.user);
    return new Response("Finished", { status: 200 });
};