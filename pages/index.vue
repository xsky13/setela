<script setup>
const loading = ref(true);
const user = useSupabaseUser();
</script>
<template>
    <!-- <Loading v-if="loading" /> -->
    <div>
        <div v-if="user" class="container">
            
            <Account />
        </div>
        <Auth v-if="!user" />
    </div>
</template>
