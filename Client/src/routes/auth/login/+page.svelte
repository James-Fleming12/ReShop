<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    export let form;
    onMount(()=> {
        if (form && form.success){
            goto("/");
        }
    });
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<h1>Login</h1>
<form method="POST" use:enhance>
    <input type="text" id="email" name="email" placeholder="Email..." autocomplete="off" required/>
    <input type="password" id="password" name="password" placeholder="Password..." required/>
    <button type="submit">Submit</button>
    {#if form}
        <p class="warning">{form.message}</p>
    {/if}
</form>

<p>Don't have an account? <a href="/auth/register">Regsiter</a></p>

<style lang="scss">
    .warning{
        color: red;
    }
</style>