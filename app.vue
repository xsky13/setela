<script setup>
// const user = useSupabaseUser();
const user = ref(null);
const supabase = useSupabaseClient();
const name = ref(null);
const isLoading = ref(true);

onMounted(async () => {
    try {
        const { data } = await supabase.auth.getSession();
        // if (data) {
        //     user.value = data.session.user;
        // }

        const { data: profile } = await supabase
            .from("profiles")
            .select()
            .eq("id", data.session.user.id)
            .single();

        if (profile) {
            name.value = profile.full_name;
            user.value = profile;
        }
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
    }
});

</script>

<template>
    <div>
        <NuxtLoadingIndicator :height="7" />
        <Loading v-if="isLoading" />
        <div v-else>
            <ClientOnly>
                <Suspense>
                    <div>
                        <Header :user="user" :name="name" />
                        <NuxtPage :user="user" />
                    </div>
                    <template #fallback>
                        <Loading />
                    </template>
                </Suspense>
                <template #placeholder>
                    <Loading />
                </template>
            </ClientOnly>
        </div>
    </div>
</template>
