<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let form;
    onMount(() => {
        if (form && form.success){
            goto("/auth/login");
        }
    })
</script>

<svelte:head>
    <title>Register</title>
</svelte:head>

<h1>Register</h1>
<form method="POST" >
    <input type="text" name="email" id="email" placeholder="Email" autocomplete="off" required/>    
    <input type="text" name="username" id="username" placeholder="Username" autocomplete="off" required/>
    <input type="password" name="password" id="password" placeholder="Password" required/>
    <input type="password" name="confirmation" id="confirmation" placeholder="Password Confirmation" required/>
    <button type="submit">Submit</button>
</form>
{#if form}
    <p>{form.message}</p>
{/if}
<p>Already have an account? <a href="/auth/login">Signin</a></p>