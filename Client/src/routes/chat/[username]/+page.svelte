<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";
    export let data: PageData;
    export let form;
    if (form && form.success) {
        data.messages.push(form.sent);
    }
</script>

<svelte:head>
    <title>ReShop Chat</title>
</svelte:head>

<h1>Chat with ...</h1>

<form method="POST" action="?/send" use:enhance>
    <input type="text" name="message" id="message" required />
    <button type="submit">Send</button>
</form>

{#if !data.success}
    <p class="warning">{data.message}</p>
{:else}
    {#if data.messages.length < 1}
        <p>No Messages to Display</p>
    {/if}
    {#each data.messages as message}
        <div class={message.user === data.username ? "own" : "other" }>
            <p>"{message.message}"</p>
            {#each message.images as image}
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img src="{image}" alt="Picture"/>
            {/each}
        </div>
        <br/>
    {/each}
{/if}

<style lang="scss">
    @mixin message-container{
        border: 1px solid black;
    }

    .warning{
        color: red;
    }
    .own{
        @include message-container;
        float: right;
        color: green;
    }
    .other{
        @include message-container;
        float: left;
        color: black;
    }
</style>