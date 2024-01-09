<script lang="ts">

    let responseMessage: string;
    async function submit(e: SubmitEvent){
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const response = await fetch("/api/manage/listing", {
            method: "POST",
            body: formData,
        }).catch((e) =>{
            return null;
        });
        if (!response) {
            responseMessage = "Server Error";
        }else if (!response.ok){
            let data = await response.json().catch(() => { message: "Error" });
            responseMessage = data.message;
        }else{
            let data = await response.json().catch(() => { message: "Error" });
            window.location.href = data.url; // if you redirect in the API instead, it doesn't load quickly enough to redirect anyways
        }
    }

    let inputs = [1]
    const addInput = () => {
        inputs = [...inputs, inputs[inputs.length-1]+1];
        console.log(inputs);
    }
    const removeInput = () => {
        inputs = inputs.slice(0, inputs.length-1);
        console.log(inputs);
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

<form on:submit={submit} enctype="multipart/form-data">
    <h1>Title</h1>
    <input type="text" id="title" name="title" autocomplete="off" required />
    <hr>
    <h1>Bio</h1>
    <textarea id="bio" name="bio" required/>
    <hr>
    <h1>Item's Value</h1>
    <input type="number" id="value" name="value" required>
    <hr>
    {#each inputs as i}
        <input type="file" id={"image"+i.toString()} name={"image"+i.toString()} accept="image/*" required/>
    {/each}
    {#if inputs.length < 5} <!-- Maximum of 5 images sent -->
        <button on:click={addInput}>Add</button>
    {/if}
    {#if inputs.length > 1} <!-- Minimum of 1 image sent -->
        <button on:click={removeInput}>Remove</button>
    {/if}
    <button type="submit">Submit</button>
    {#if responseMessage}
        <p class="warning">{responseMessage}</p>
    {/if}
</form>