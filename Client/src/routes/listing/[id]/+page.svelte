<script lang="ts">  
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    export let data: PageData;
    onMount( () => { 
        if (!data.success) goto("/") 
    });
</script>

<svelte:head>
    <title>Create a Listing</title>
</svelte:head>

{#if data.listing}
    <h1>{data.listing.title} - ${data.listing.value}</h1>
    <p>{data.listing.bio}</p>
    <p>Listing by <a href={"/profile/" + data.listing.created}>{data.listing.created}</a></p>
    {#each data.pictures as source}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src={source} alt="Picture"/>
    {/each}
    <p>Posted on: {data.listing.created}</p>
{/if}