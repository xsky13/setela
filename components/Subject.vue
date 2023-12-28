<script setup>
const props = defineProps(["subject", "subjectElementNumber", "removeSubject"]);

const deleteSubjectModalRef = ref();

defineExpose({ deleteSubjectModalRef });

</script>

<template>
    <div
        class="rounded-lg bg-gray-50 border border-dashed px-6 py-4 my-5 flex justify-between"
    >
        <div>
            <NuxtLink
                :to="
                    `/a/` +
                    props.subject.year.id +
                    '/trimestre/' +
                    props.subject.trimester.id +
                    '/periodo/' +
                    props.subject.subject.id
                "
                class="text-sm md:text-base"
                >{{ props.subject.subject.title }}</NuxtLink
            >
            <br />
            <span class="text-sm text-gray-600">
                {{ props.subject.trimester.title }} •
                <NuxtLink :to="`/a/` + props.subject.year.id" class="text-sm">{{
                    props.subject.year.title
                }}</NuxtLink>
            </span>
        </div>
        <Modal
            :condition="true"
            :text="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-red-600'><path stroke-linecap='round' stroke-linejoin='round' d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0' /></svg>`"
            class="cursor-pointer"
            title="Eliminar materia"
            ref="deleteSubjectModalRef"
        >
            <p class="py-6">Esta seguro que quiere eliminar esta materia?</p>
            <button class="btn btn-danger w-full" @click="() => props.removeSubject(props.subject.subject.id, props.subjectElementNumber)">Eliminar</button>
        </Modal>
    </div>
</template>
