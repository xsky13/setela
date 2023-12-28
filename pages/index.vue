<script setup>
const loading = ref(true);
const user = useSupabaseUser();
</script>
<template>
    <!-- <Loading v-if="loading" /> -->
    <div>
        <div v-if="user" class="block m-auto w-10/12 md:w-9/12 lg:w-7/12 pt-40">
            <Account />
        </div>
        <Auth v-if="!user" />
    </div>
</template>
