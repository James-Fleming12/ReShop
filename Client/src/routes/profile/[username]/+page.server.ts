import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const username = params.username;
    const response = await fetch(API_URL + "/user/get/" + username).catch((e) => {
        console.log(`Server Error Fetching User Information: ${e}`);
        return null;
    });
    if (!response || !response.ok) return { message: "Server Error" };
    const data = await response.json().catch((e) => {
        console.log(`Server Error: ${e}`);
        return null;
    });
    if (!data) return { message: "Server Error" };
    const imageRes = await fetch(API_URL + "/user/pfp/" + username).catch((e) => {
        console.log(`Server Error Fetching Profile Picture: ${e}`);
        return null;
    });
    if (!imageRes) return { message: "Server Error" };
    const data2 = await imageRes.json().catch((e) => {
        console.log(`Server Error: ${e}`);
        return null;
    });
    if (!data2) return { message: "Server Error" };
    if (!response.ok) return { message: data2.message };
    const postsRes = await fetch(API_URL + "/listing/getuser/" + username).catch((e) => {
        console.log(`Server Error Fetching User's Posts: ${e}`);
        return null;
    });
    if (!postsRes || !postsRes.ok) return { message: "Server Error" };
    const postdata = await postsRes.json().catch(() => null);
    if (!postdata) return { message: "Invalid Server Response Fetching Posts" };
    return { 
        username: username,
        name: data.user.name,
        bio: data.user.bio,
        source: data2.url,
        posts: postdata.posts,
    };
}) satisfies PageServerLoad;