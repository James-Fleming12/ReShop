<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let form;
    let inputs = [1];
    const addInput = () => {
        inputs = [...inputs, inputs[inputs.length-1] + 1]
    }
    const removeInput = () => {
        inputs = inputs.slice(0, inputs.length-1);
    }
    onMount(() => {
        if(form){
            if(form.message === "Invalid Tokens"){
                goto("/");
            }
            if (form.url){
                goto(form.url);
            }
        }  
    })
</script>

<svelte:head>
    <title>Create a Listing</title>
</svelte:head>

<h1>Create Listing</h1>
<form method="POST" enctype="multipart/form-data">
    <label for="title">Title</label>
    <input type="text" id="title" name="title" autocomplete="off" required/>
    <hr>
    <label for="bio">Details</label>
    <textarea id="bio" name="bio" required/>
    <hr>
    <label for="value">Item's Value</label>
    <input type="number" id="value" name="value"/>
    <hr>
    <h1>Pictures</h1>
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
    {#if form && form.message}
        <p class="warning">{form.message}</p>
    {/if}
</form>