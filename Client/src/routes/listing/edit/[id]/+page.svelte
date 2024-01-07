<script lang="ts">  
    export let data;
    export let form;

    let curr = 0;
</script>

<svelte:head>
    <title>Edit Listing</title>
</svelte:head>

<h1>Edit Listing</h1>
<form method="POST" enctype="multipart/form-data">
    <input type="text" id="title" name="title" value={data.listing.title}/>
    <textarea id="bio" name="bio">{data.listing.bio}</textarea>
    <button type="submit">Make Changes</button>
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