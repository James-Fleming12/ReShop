<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;
    // export let form;
</script>

<svelte:head>
    <title>ReShop Chat</title>
</svelte:head>

<h1>Chat with ...</h1>

{#if !data.success}
    <p class="warning">{data.message}</p>
{:else}
    {#each data.messages as message}
        <p class={message.user === data.username ? "own" : "other" }>{message.message}</p>
        {#each message.images as image}
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src={image} alt="Picture"/>
        {/each}
    {/each}
{/if}

<style lang="scss">
    .warning{
        color: red;
    }
    .own{
        color: green;
    }
    .other{
        color: black; // get floats right for these
    }
</style>