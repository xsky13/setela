<script setup>
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

const props = defineProps([
    "subject",
    "addProfesorStatus",
    "elementIndex",
    "loading",
    "adminIsProfesor",
    "removeSubject"
]);
const supabase = useSupabaseClient();

const loading = ref(true);
const subjectProfesor = ref();
const profesorStatusLoading = ref(false);

const { data: trimester } = await supabase
    .from("trimester")
    .select()
    .eq("id", props.subject.trimesterId)
    .single();

if (trimester) loading.value = false;

// Set the subjects profesor if it exists
if (props.subject.userId) {
    const { data: subjectUser } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", props.subject.userId)
        .single();

    if (subjectUser) subjectProfesor.value = subjectUser;
}

const getYearText = computed(() => {
    if (trimester) {
        if (trimester.yearId == "1") {
            return "Primer año";
        } else if (trimester.yearId == "2") {
            return "Segundo año";
        } else if (trimester.yearId == "3") {
            return "Tercer año";
        } else if (trimester.yearId == "4") {
            return "Cuarto año";
        }
    }
});

defineExpose({ profesorStatusLoading, test: "hello" });
</script>

<template>
    <div v-if="loading" class="box my-8">
        <i>Cargando materia...</i>
    </div>
    <div v-else>
        <div class="box my-8 md:!flex justify-between items-start">
            <div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="font-medium text-sm text-blue-700">
                            {{ getYearText }}
                        </div>
                        <ChevronRightIcon
                            class="w-4 h-4 ml-2 mt-0.5 text-gray-600"
                        />
                        <div class="text-sm text-gray-600 ml-2">
                            {{ trimester.title }}
                        </div>
                    </div>
                </div>
                <NuxtLink
                    :to="`/a/${trimester.yearNumber}/trimestre/${trimester.id}/periodo/${props.subject.id}`"
                    class="inline-block mt-2"
                >
                    {{ props.subject?.title }}
                </NuxtLink>
                <div v-if="!props.adminIsProfesor">
                    <div
                        v-if="props.subject.name"
                        class="text-sm text-gray-600"
                    >
                        Profesor: {{ props.subject.name }}
                    </div>
                    <div v-else class="text-sm text-gray-600">
                        Esta materia no tiene profesor
                    </div>
                </div>
            </div>
            <button
                v-if="!props.adminIsProfesor"
                @click="
                    () =>
                        props.addProfesorStatus(
                            props.subject.id,
                            props.elementIndex
                        )
                "
                type="button"
                class="btn btn-primary w-full mt-4 md:w-auto md:mt-0"
            >
                <img
                    v-if="props.subject.loading"
                    src="/loading_white.svg"
                    width="20"
                    alt="cargando..."
                />
                <span v-else>Hacerse profesor de materia</span>
            </button>
            <div v-else>
                <button
                    @click="
                        () =>
                            props.removeSubject(
                                props.subject.id,
                                props.elementIndex
                            )
                    "
                >
                    <img
                        v-if="props.subject.loading"
                        src="/loading_gray.svg"
                        width="20"
                        alt="cargando..."
                    />
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5 text-red-600 cursor-pointer mt-2 md:mt-0"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
