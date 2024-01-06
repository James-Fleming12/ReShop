import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    let res = {
        message: "Server Error",
        success: false,
        listing: {
            title: "",
            bio: "",
            value: 0,
            created: undefined,
        },
        pictures: [""],
    }
    const response = await fetch(API_URL + "/listing/get/" + params.id).catch(() => null);
    if (!response) return res;
    const data = await response.json().catch(() => null);
    if (!data) return res;
    if (!response.ok) { res.message=data.message ; return res };
    res.listing = data.listing;
    res.pictures = data.urls;
    res.success = true;
    res.message = "Success";
    return res;
}) satisfies PageServerLoad;