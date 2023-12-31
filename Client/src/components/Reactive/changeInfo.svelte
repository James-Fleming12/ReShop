<script lang="ts">
    let responseMessage: string;
    async function submit(e: SubmitEvent){
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const response = await fetch("", {
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

</style>

<form>

</form>