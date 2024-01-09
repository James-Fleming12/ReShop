<script lang="ts">
    export let name: string;
    export let userBio: string;

    let responseMessage: string;
    async function submit(e: SubmitEvent){
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const response = await fetch("/api/manage/user", {
            method: "POST",
            body: formData,
        }).catch(() => null);
        if (!response){
            responseMessage = "API Error";
        }else{
            const data = await response.json().catch(() => { message: "Error" });
            responseMessage = data.message;
        }
    }
</script>

<style>
    * {
        padding:0;
        margin:0;
    }
    button{
        padding:10px;
    }
</style>

<form on:submit={submit}>
    <label>
        Name
        <input type="text" id="name" name="name" placeholder="{name}" autocomplete="off" />
    </label>
    <label>
        Bio
        <textarea id="bio" name="bio" placeholder="{userBio}"></textarea>
    </label>
    <button type="submit">Submit</button>
    {#if responseMessage}
        <p class="warning">{responseMessage}</p>
    {/if}
</form>