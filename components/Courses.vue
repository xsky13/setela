<script setup>
const loading = ref(true);
const requestLoading = ref(false);
const years = ref([]);

const props = defineProps(["user"]);
const supabase = useSupabaseClient();

const checkForYears = async () => {
    await supabase
        .from("year")
        .select()
        .then((res) => {
            loading.value = false;
            years.value = res.data;
        });
};

checkForYears();

const handleCreateCourses = () => {
    requestLoading.value = true;
    createCourses().then(() => {
        alert("Los cursos han sido creados")
        requestLoading.value = false;
        checkForYears();
    });
};
</script>

<template>
    <div>
        <img v-if="loading" src="/loading.svg" class="block m-auto w-20 py-6" />
        <div v-else>
            <div v-if="years.length"></div>
            <div
                v-else
                class="w-full rounded-lg bg-gray-50 border border-dashed my-8 text-center py-8"
            >
                <p>Todavía no hay cursos</p>
                <button
                    class="btn btn-primary mt-1"
                    @click="handleCreateCourses"
                >
                    <img
                        src="/loading_white.svg"
                        class="block m-auto"
                        width="20"
                        v-if="requestLoading"
                    />
                    <span v-else>Crear Cursos</span>
                </button>
            </div>
        </div>
    </div>
</template>
