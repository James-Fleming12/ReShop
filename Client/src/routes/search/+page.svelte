<script lang="ts">  
    import { applyAction, enhance } from '$app/forms';
    export let data;
    export let form;

    let curr = 0;
</script>

<svelte:head>
    <title>Search</title>
</svelte:head>

<h1>Search Page</h1>
<form method="POST" use:enhance={({ formElement, formData, action, cancel }) => {
    formData.append("time", data.time.toString());
    formData.append("curr", curr.toString());
    return async ({ result }) => {
        await applyAction(result);
    }
}}
>
    <input type="radio" id="listingsearch" name="searchopt" value="Listing" checked/>
    <label for="listingsearch">Search Listings</label>
    <input type="radio" id="usersearch" name="searchopt" value="User"/>
    <label for="usersearch">Search Users</label>
    <input type="text" id="search" name="search"/>
    <button type="submit">Search</button>
    {#if curr > 0}
        <button on:click={() => {curr-=10}} type="submit">Left</button>
    {/if}
</form>

{#if form && form.message}
    <p>{form.message}</p>
{/if}

{#if form && form.posts}
    {#each form.posts as post}
        <p>{post}</p>
    {/each}
{/if}