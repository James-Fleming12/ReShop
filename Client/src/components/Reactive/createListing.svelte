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
        }else{
            let data = await response.json().catch(() => { message: "Error" });
            responseMessage = data.message;
        }
    }

    let inputs = [1]

    const addInput = () => {
        inputs = inputs.slice(0, inputs.length-1);
        console.log(inputs);
    }

    const removeInput = () => {
        inputs = [...inputs, inputs[inputs.length-1]+1];
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
    <input type="text" id="title" name="title" required/>
    <textarea id="bio" name="bio" required/>
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