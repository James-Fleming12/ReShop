<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;
    export let form;
</script>

<svelte:head>
    <title>ReShop Chat</title>
</svelte:head>

<h1>Chat with ...</h1>

{#if !data.success}
    <p class="warning">{data.message}</p>
{:else}
    <p>Chat</p>
{/if}

<style lang="scss">
    .warning{
        color: red;
    }
</style>