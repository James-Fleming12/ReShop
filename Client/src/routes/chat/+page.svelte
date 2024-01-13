<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;
    export let form;
</script>

<svelte:head>
    <title>ReShop Chat</title>
</svelte:head>

<form method="POST" action="?/search">
    <p>Search For Users</p>
    <input type="text" id="search" name="search" required />
    <button type="submit">Search</button>
</form>

{#if !form}
    {#if data.success && data.users && data.users.length > 1}
        {#each data.users as user}
        <div class="usercontain">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src={user.pfp} alt="Profile Picture" width=100 height=100/>
            <p><a href={"/chat/" + user.username}>{user.username}</a></p>
        </div>
        {/each}
    {:else if data.success}
        <p>No Active Messages</p>
    {:else}
        <p class="warning">{data.message}</p>
    {/if}
{:else}
    {#if form.success && form.users.length > 0}
        {#each form.users as user}
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src="{user.pfp}" alt="Profile Picture" width=100 height=100/>
            <p><a href="{"/chat/" + user.username}">{user.username}</a></p>
        {/each}
    {:else if form.success}
        <p>No Matching users</p>
    {:else}
        <p class="warning">{form.message}</p>
    {/if}
{/if}

<style lang="scss">
    .usercontain{
        border: 1px solid black;
    }
    .warning{
        color: red;
    }
</style>