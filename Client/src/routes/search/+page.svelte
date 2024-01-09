<script lang="ts">  
    import { applyAction, enhance } from '$app/forms';
    export let data;
    export let form;

    let curr = 0;
</script>

<svelte:head>
    <title>Search - ReShop</title>
</svelte:head>

<h1>Search Page</h1>
<form method="POST" use:enhance={({ formElement, formData, action, cancel }) => {
    formData.append("time", data.time.toString());
    formData.append("skips", curr.toString());
    return async ({ result }) => {
        await applyAction(result);
    }
}}
>
    <input type="text" id="search" name="search" placeholder="Search..."/>
    <button type="submit">Search</button>
    {#if curr > 0} <!-- Might not work properly (if the submit gets sent first) -->
        <button on:click={() => {curr-=10}} type="submit">Prev</button>
    {/if}
    {#if data.listings.length == 10} <!-- Same goes for this -->
        <button on:click={() => {curr+=10}} type="submit">Next</button>
    {/if}
</form>

<hr/>

{#if form && form.message}
    <p>{form.message}</p>
{/if}

{#if form && form.posts}
    {#each form.posts as post}
        <div class="container">
            <p><strong><a href={"/listing/" + post.postId}>{post.title}</a></strong></p>
            <p>{post.bio}</p> <!-- Shorten this if too long -->
            <p>Value: {post.value}</p>
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src={post.pictures[0]} alt="Listing Picture" width=100 height=100/>
        </div>
    {/each}
{:else}
    {#each data.listings as post}
        <div class="container">
            <p><strong><a href={"/listing/" + post.postId}>{post.title}</a></strong></p>
            <p>{post.bio}</p> <!-- Shorten this if too long -->
            <p>Value: {post.value}</p>
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src={post.pictures[0]} alt="Listing Picture" width=100 height=100/>
        </div>
    {/each}
{/if}

<style lang="scss">
    .container{
        border: 1px solid black;
    }
</style>