export const checklogin = async (token: string) => {
    let usernamec: String | null = "";
    const response = await fetch(import.meta.env.API_URL + "/validate", {
        method: "POST",
        mode: "cors",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
        }),
    });
    if(!response || !response.ok){
        usernamec = null;
    }else{
        const jsonRes = await response.json();
        usernamec = jsonRes.user;
    }
    return { usernamec };
}