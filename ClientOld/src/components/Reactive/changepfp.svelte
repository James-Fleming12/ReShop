<script lang="ts">
    let responseMessage: string;
    async function submit2(e: SubmitEvent){
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const response = await fetch("/api/manage/pfp", {
            method: "POST",
            body: formData,
        }).catch((e) =>{
            return null;
        });
        if (!response) {
            responseMessage = "Server Error";
        }else{
            let data = await response.json().catch(() => { message: "Error" });
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

<form on:submit={submit2} enctype="multipart/form-data">
    <input type="file" id="image" name="image" accept="image/*" required/>
    <button type="submit">Submit</button>
    {#if responseMessage}
        <p class="warning">{responseMessage}</p>
    {/if}
</form>