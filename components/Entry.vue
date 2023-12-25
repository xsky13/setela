<script setup>
const props = defineProps([
    "entry",
    "user",
    "deleteEntry",
    "entryNumber",
    "userIsProfesor",
    "gradeHomework",
]);
const deleteEntryModalRef = ref();
const modalLoading = ref(false);

const gradeHomeworkModalRef = ref();
const gradeHomeworkModalLoading = ref(false);

defineExpose({
    deleteEntryModalRef,
    modalLoading,
    gradeHomeworkModalRef,
    gradeHomeworkModalLoading,
});

const entryGrade = ref();
</script>

<template>
    <div class="box !bg-white !flex justify-between items-start my-6">
        <div>
            <NuxtLink :to="props.entry.link" class="link">{{
                props.entry.linkName
            }}</NuxtLink>
            <div class="my-2">{{ props.entry.text }}</div>

            <div class="text-sm text-gray-600">
                {{
                    new Intl.DateTimeFormat("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }).format(new Date(props.entry.created_at))
                }}
            </div>
        </div>

        <div class="flex flex-col items-center">
            <div v-if="props.userIsProfesor" class="mb-2">
                <Modal
                    :condition="true"
                    text="Evaluar"
                    title="Evaluar trabajo practico"
                    ref="gradeHomeworkModalRef"
                >
                    <form
                        @submit.prevent="
                            () =>
                                props.gradeHomework(
                                    props.entry.id,
                                    entryGrade,
                                    entryNumber
                                )
                        "
                    >
                        <div class="my-6">
                            <label for="grade">Nota</label>
                            <input
                                type="number"
                                class="text-field"
                                v-model="entryGrade"
                            />
                        </div>
                        <button class="btn btn-primary w-full">
                            <img
                                v-if="gradeHomeworkModalLoading"
                                src="/loading_white.svg"
                                width="20"
                            />
                            <span v-else>Someter</span>
                        </button>
                    </form>
                </Modal>
            </div>
            <div v-if="props.user?.id == entry.userId">
                <Modal
                    :condition="props.user?.id == entry.userId"
                    :text="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-red-600'><path stroke-linecap='round' stroke-linejoin='round' d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0' /></svg>`"
                    class="cursor-pointer"
                    title="Eliminar entrega"
                    ref="deleteEntryModalRef"
                >
                    <p class="py-6">
                        Esta seguro que quiere eliminar esta entraga? Esta
                        acción es irreversible.
                    </p>
                    <button
                        :disabled="modalLoading"
                        class="btn btn-danger w-full"
                        @click="
                            () => props.deleteEntry(props.entryNumber, entry.id)
                        "
                    >
                        <img
                            v-if="modalLoading"
                            src="/loading_white.svg"
                            width="20"
                        />
                        <span v-else>Eliminar</span>
                    </button>
                </Modal>
            </div>
            <div
                v-if="props.entry.grade"
                :class="props.user?.id == entry.userId ? 'w-10 h-10 mt-2 flex items-center justify-center text-xs font-bold bg-gray-900 rounded-full shadow-xl text-white' : 'text-sm text-gray-600'"
            >
                {{ props.entry.grade }}%
            </div>
            <div v-else class="text-gray-600 text-sm">Por evaluar</div>
        </div>
    </div>
</template>
