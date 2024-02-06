<script setup>
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from "@headlessui/vue";

const isOpen = ref(false);
const props = defineProps({
    text: String,
    condition: Boolean,
    title: String,
    width: String,
    class: String,
    openFunction: Function,
    height: String
});

function closeModal() {
    isOpen.value = false;
}
function openModal() {
    isOpen.value = true;
}

defineExpose({ closeModal, openModal, isOpen });
</script>
<template>
    <div>
        <div class="">
            <button
                v-if="props.condition"
                @click="
                    () =>
                        props.openFunction ? props.openFunction() : openModal()
                "
                type="button"
                :class="props.class || 'btn btn-secondary bg-gray-100 mt-2'"
                v-html="props.text"
            >
            </button>
        </div>
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-[105]">
                <TransitionChild
                    as="template"
                    enter="duration-300 ease-out"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="duration-200 ease-in"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-black bg-opacity-25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div
                        class="flex min-h-full items-center justify-center p-4 text-center"
                    >
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <DialogPanel
                                :class="`${
                                    props.width ? 'md:' + props.width : 'w-full md:max-w-xl'
                                } px-5 md:px-6 max-h-[36rem] ${props.height} overflow-y-scroll transform overflow-hidden rounded-2xl border-[14px] border-white bg-white p-6 text-left align-middle shadow-xl transition-all`"
                            >
                                <DialogTitle
                                    as="h1"
                                    class="text-3xl flex items-center justify-between"
                                >
                                    <span class="text-3xl heading">{{ props.title }}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-7 h-7 cursor-pointer"
                                        @click="closeModal"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </DialogTitle>
                                <slot />

                                <!-- <div class="mt-4">
                                    <button
                                        type="button"
                                        class="btn btn-secondary"
                                        @click="closeModal"
                                    >
                                        Cerrar
                                    </button>
                                </div> -->
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>
