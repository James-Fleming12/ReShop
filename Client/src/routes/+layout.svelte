<script lang="ts">
    import { redirect } from "@sveltejs/kit";
    export let data;
</script>

<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Test Title</title>
    </head>
    <body>
        <ul>
        {#each data.urls as url}
            <li><a href={url[0]}>{url[1]}</a></li>
        {/each}
        </ul>
        <slot />
    </body>
</html>