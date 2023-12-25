<script setup>
const props = defineProps(["user"]);
const subjectData = ref(null);
const loading = ref(true);

await getProfesorSubjects(props.user.id).then((res) => {
    subjectData.value = res;
    loading.value = false;
});
</script>
<template>
    <img v-if="loading" src="/loading.svg" class="block m-auto w-20 py-6" />
    <div
        v-else
        class="rounded-lg bg-gray-50 border border-dashed px-6 py-4 my-5"
    >
        <div v-if="!subjectData.subject">
            <span class="font-bold text-center"
                >Todavia no tienes una materia</span
            >
        </div>
        <div v-else>
            <NuxtLink
                :to="
                    `/a/` +
                    subjectData.subjectYear.id +'/trimestre/' +
                    subjectData.subjectTrimester.id +
                    '/periodo/' +
                    subjectData.subject.id
                "
                >{{ subjectData.subject.title }}</NuxtLink
            >
            <br />
            <span class="text-sm text-gray-600">
                {{ subjectData.subjectTrimester.title }} •
                <NuxtLink
                    :to="`/a/` + subjectData.subjectYear.id"
                    class="text-sm"
                    >{{ subjectData.subjectYear.title }}</NuxtLink
                >
            </span>
        </div>
    </div>
</template>
