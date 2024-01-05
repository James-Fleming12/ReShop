import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
    cookies.delete("jwt-token", { path: "/" });
    cookies.delete("username", { path: "/" });
    return redirect("/");
}