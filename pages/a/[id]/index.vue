<script setup>
const route = useRoute();
const supabase = useSupabaseClient();
const yearExists = ref(null);
const year = ref();
const trimesters = ref();

// get year based on param id
const { data: supaYear } = await supabase
    .from("year")
    .select("id, title")
    .eq("id", route.params.id)
    .single();

if (!supaYear) {
    yearExists.value = false;
} else {
    year.value = supaYear;
    yearExists.value = true;

    const { data: tri } = await supabase.from("trimester").select("id, title").eq("yearId", supaYear.id);

    if (tri) {
        trimesters.value = tri;
    }
}

</script>
<template>
    <div class="container">
        <Breadcrumbs :links="[{ to: '#', text: year.title, last: true}]" />
        <h1 v-if="!yearExists" class="text-center">Este año no existe</h1>
        <div v-else>
            <h1>{{ year.title }}</h1>
            <NuxtLink v-for="trimester in trimesters" :to="`./${route.params.id}/trimestre/` + trimester.id" class="box my-5">
                {{ trimester.title }}
            </NuxtLink>
        </div>
    </div>
</template>
