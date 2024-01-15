<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import io from 'socket.io-client';

    export let data: PageData;
    export let form;
    if (form && form.success) {
        data.messages.push(form.sent);
    }

    interface MessageEventData {
        message: string,
        user: string,
        images?: string[] | undefined,
    }

    onMount(() => {
        const token = data.token;
        const username = data.username;
        const socket = io(data.socketurl, {
            transports: ['websocket'],
            auth: {
                token: token,
                username: username,
            },
        });
        socket.io.on("error", (error) => {
            console.log(`Connection Error: ${error}`);
        });
        socket.on("message", (messageData: MessageEventData) => {
            const { message, images, user } = messageData;
            if (!message || !user) console.log("Server Error");
            if (user === data.other) data.messages = [...data.messages, { message: message, sender: user, images: images ? images : [] } ];
        });
    });
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
        <div class={message.sender === data.username ? "own" : "other" }>
            <p>{message.sender}</p>
            <p>"{message.message}"</p>
            {#each message.images as image}
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img src="{image}" alt="Picture"/>
            {/each}
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
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