import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    let returnData = {
        message: "Server Error",
        username: params.username,
    }
    const response = await fetch(API_URL).catch(() => null);
    if (!response) return returnData;
    const data = await response.json().catch(() => null);
    if (!data) return returnData;
    returnData.message = data.message;
    return returnData;
}) satisfies PageServerLoad;