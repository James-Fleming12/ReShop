<script lang="ts">  
    export let data;
    export let form;

    let photoForm: boolean = false;
    let inputs = [1];
    const addInput = () => {
        inputs = [...inputs, inputs[inputs.length-1] + 1]
    }
    const removeInput = () => {
        inputs = inputs.slice(0, inputs.length-1);
    }
</script>

<svelte:head>
    <title>Edit Listing</title>
</svelte:head>

<h1>Edit Listing</h1>
<form method="POST" action="?/edit" enctype="multipart/form-data" >
    <input type="text" id="title" name="title" value={data.listing.title} autocomplete="off"/>
    <textarea id="bio" name="bio">{data.listing.bio}</textarea>
    <input type="number" id="value" name="value" value={data.listing.value}/>
    {#if !photoForm}
        <button on:click={(() => photoForm = true)}>Reset Listing Photos</button>
    {:else}
        {#each inputs as i}
        <input type="file" id={"image"+i.toString()} name={"image"+i.toString()} accept="image/*" required/>
        {/each}
        {#if inputs.length < 5} <!-- Maximum of 5 images sent -->
            <button on:click={addInput}>Add</button>
        {/if}
        {#if inputs.length > 1} <!-- Minimum of 1 image sent -->
            <button on:click={removeInput}>Remove</button>
        {/if}
    {/if}
    <button type="submit">Make Changes</button>
</form>

<hr/>

<form method="POST" action="?/delete">
    <h1>Type in Listing Name</h1> <!-- Security Check: Ensure Deletion is Wanted -->
    <input type="text" id="title" name="title" autocomplete="off" /> <!-- I also just don't know how to do GET requests in SvelteKit yet -->
    <button type="submit">Delete Listing</button>
</form>

{#if form}
    <p class={form.success ? 'succ' : 'warn'}>{form.message}</p>
{/if}

<style lang="scss">
    .succ{
        color: green;
    }
    .warn{
        color: red;
    }
</style>