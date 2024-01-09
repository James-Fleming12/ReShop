<script lang="ts">
    let responseMessage: string;
    async function submit(e: SubmitEvent){
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const response = await fetch("/api/auth/signin", {
            method: "POST",
            body: formData,
        });
        if(response.ok){
            window.location.href = "/";
        }
        const data = await response.json();
        responseMessage = data.message;
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
    .warning{
        color:red;
    }
</style>

<form on:submit={submit}>
    <label>
        Email
        <input type="text" id="email" name="email" autocomplete="off" required/>
    </label>
    <label>
        Password
        <input type="password" id="password" name="password" required/>
    </label>
    <button type="submit">Submit</button>
    {#if responseMessage}
        <p class="warning">{responseMessage}</p>
    {/if}
</form>