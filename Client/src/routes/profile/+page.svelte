<script lang="ts">  
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";

    export let data: PageData;

    export let form;

    const logout = () => {
        goto("/auth/logout");
    }
</script>

<svelte:head>
    <title>Your ReShop Profile</title>
</svelte:head>

<h1>Your Profile</h1>
<!-- svelte-ignore a11y-img-redundant-alt -->
<img src={data.source} alt="Profile Picture" width=100 height=100/>
<form method="POST" action="?/changePfp" enctype="multipart/form-data">
    <input type="file" id="image" name="image" accept="image/*" required>
    <button type="submit">Change Profile Picture</button>
    {#if form && !form.info}
        {#if form.success}
            <p class="success">{form.message}</p>
        {:else}
            <p class="warning">{form.message}</p>
        {/if}
    {/if}
</form>
<hr/>
<form method="POST" action="?/changeInfo">
    <label for="name">Name</label>
    {#if data.name}
        <input type="text" name="name" id="name" value={data.name}/>
    {:else} 
        <input type="text" name="name" id="name" />
    {/if} 
    <label for="bio">Bio</label>
    {#if data.bio}
        <textarea name="bio" id="bio" value={data.bio}/>
    {:else} 
        <textarea name="bio" id="bio"/>
    {/if} 
    <button type="submit">Submit</button>
</form>
{#if data.message}
    <p class="warning">{data.message}</p>
{/if}
{#if form && form.info}
    {#if form.success}
        <p class="success">{form.message}</p>
    {:else}
        <p class="warning">{form.message}</p>
    {/if}
{/if}
<button on:click={logout}>Log Out</button>

<style lang="scss">
    .warning{
        color:red;
    }
    .success{
        color:green;
    }
</style>