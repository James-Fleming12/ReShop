<script lang="ts">  
    import { applyAction, enhance } from '$app/forms';
    export let data;
    export let form;

    let curr = 0;
    let pageAmount = 10;
</script>

<svelte:head>
    <title>Search - ReShop</title>
</svelte:head>

<h1>Search Page</h1>
<form method="POST" use:enhance={({ formElement, formData, action, cancel }) => {
    formData.append("time", data.time.toString());
    formData.append("skips", (curr).toString());
    formData.append("wanted", pageAmount.toString());
    formData.append("querDate", data.time.toString());
    return async ({ result }) => {
        await applyAction(result);
    }
}}>
    <input type="text" id="search" name="search" placeholder="Search..." autocomplete="off" />
    <label for="minval">Minimum Value</label>
    <input type="number" id="minval" name="minval" />
    <label for="maxval">Maximum Value</label>
    <input type="number" id="maxval" name="maxval" />
    <button type="submit">Search</button>
    {#if curr > 0} <!-- Might not work properly (if the submit gets sent first) -->
        <button on:click={() => {curr-=10}} type="submit">Prev</button>
    {/if}
    <p>Current Page: {curr+1}</p>
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
            <p><strong><a href={"/listing/" + post.postId}>
                {#if post.title.length > 45}
                    <p>{post.title.slice(42) + "..."}</p>
                {:else}
                    <p>{post.title}</p>
                {/if}
            </a></strong></p>
            {#if post.bio.length > 45}
                <p>{post.bio.slice(0, 42) + "..."}</p> 
            {:else}
                <p>{post.bio}</p>
            {/if}
            <p>Value: {post.value}</p>
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src={post.pictures[0]} alt="Listing Picture" width=100 height=100/>
        </div>
    {/each}
{:else}
    {#each data.listings as post}
        <div class="container">
            <p><strong><a href={"/listing/" + post.postId}>
                {#if post.title.length > 45}
                    <p>{post.title.slice(42) + "..."}</p>
                {:else}
                    <p>{post.title}</p>
                {/if}
            </a></strong></p>
            {#if post.bio.length > 45}
                <p>{post.bio.slice(0, 42) + "..."}</p> 
            {:else}
                <p>{post.bio}</p>
            {/if}
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