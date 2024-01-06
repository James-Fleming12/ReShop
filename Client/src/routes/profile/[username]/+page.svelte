<script lang="ts">  
    import type { PageData } from "./$types";
    export let data: PageData;
</script>

<svelte:head>
    <title>{data.username}'s Profile</title>
</svelte:head>

<h1>{data.username} Profile</h1>
<p>{data.message}</p>