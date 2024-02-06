<script setup>
const loading = ref(true);
const user = useSupabaseUser();
</script>
<template>
    <!-- <Loading v-if="loading" /> -->
    <div>
        <div v-if="user" class="container">
            <Breadcrumbs home="true" />
            <Account />
        </div>
        <Auth v-if="!user" />
    </div>
</template>
