<script lang="ts">  
    import type { PageData } from "./$types";
    export let data: PageData;
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<h1>ReShop Home Page</h1>
<p>{data.message}</p>