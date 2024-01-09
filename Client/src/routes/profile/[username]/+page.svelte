<script lang="ts">  
    import type { PageData } from "./$types";
    export let data: PageData;
</script>

<svelte:head>
    <title>{data.username}'s Profile</title>
</svelte:head>

<h1>{data.username}'s Profile</h1>
<!-- svelte-ignore a11y-img-redundant-alt -->
<img src={data.source} alt="Profile Picture" width=100 height=100/>
{#if data.name || data.bio}
    <hr>
{/if}
{#if data.name}
    <p>Name: {data.name}</p>
{/if}
{#if data.bio}
    <p>{data.bio}</p>
{/if}

<hr>

<h1>Listings</h1>

{#each data.posts as post}
    <div class="post-container">
        <p><a href={"/listing/" + post.postId}>
            {#if post.title.length > 30} 
                {post.title.slice(0, 27) + "..."}
            {:else}
                {post.title}
            {/if}
        </a> - ${post.value}</p>
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src={post.pictures[0]} alt="Post Picture" width=100 height=100 />
    </div>
{/each}