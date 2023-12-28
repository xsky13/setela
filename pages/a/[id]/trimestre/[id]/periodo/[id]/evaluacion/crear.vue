<script setup>
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/vue";
import { ref } from "vue";

const supabase = useSupabaseClient();
const route = useRoute();
const props = defineProps(['user']);

const questions = ref([
    {
        title: "",
        type: "Multiple opción",
        options: ["Opción de respuesta"],
    },
]);

const questionTypes = [
    { id: 1, type: "Multiple opción" },
    { id: 2, type: "Verdadero o falso" },
    { id: 3, type: "Abierta" },
];
const selectedType = ref(questionTypes[0]);

const title = ref("");
const error = ref();
const formLoading = ref(false);

const addQuestion = () => {
    questions.value.push({
        title: "",
        type: "Multiple opción",
        options: ["Opción de respuesta"],
    });
};

const deleteQuestion = (question) => {
    questions.value = questions.value.filter((q) => q !== question);
};

const setQuestionType = (question, type) => {
    questions.value[question].type = type;
    if (question.type !== "Multiple opción") {
        delete questions.value[question].options;
    }
};

const addOption = (question) => {
    const questionToAddOption = questions.value.filter((q) => q == question)[0];
    questionToAddOption.options.push("Opción de respuesta");
};

const deleteOption = (question, option) => {
    const questionToRemoveOption = questions.value.filter(
        (q) => q == question
    )[0];
    const optionsWithoutRemoved = questionToRemoveOption.options.filter(
        (o) => o !== option
    );
    questionToRemoveOption.options = optionsWithoutRemoved;
};

const handleSubmit = async () => {
    if (!title.value) {
        error.value = "Su evaluación no tiene título";
    } else if (!questions.value.length) {
        error.value = "Agregue preguntas para proseguir";
    } else {
        error.value = null;
        formLoading.value = true;
        // Create the test
        const { data: test } = await supabase.from("test").insert({
            title: title.value,
            started: false,
            subjectId: route.params.id,
            userId: props.user?.id
        }).select();

        if (test) {
            for (const question of questions.value) {
                // Create a question
                const { data: supabaseQuestion } = await supabase
                    .from("testquestion")
                    .insert({
                        type: question.type,
                        question: question.title,
                        testId: test[0].id,
                    })
                    .select();

                if (supabaseQuestion) {
                    // If the question type is multiple then create the options
                    if (question.type == "Multiple opción") {
                        question.options.forEach(async (option) => {
                            await supabase.from("questionoption").insert({
                                option,
                                testQuestionId: supabaseQuestion[0].id,
                            });
                        });
                    }
                }
            }
        }

        formLoading.value = false;
        navigateTo("../");
    }
};
</script>
<template>
    <div class="container">
        <h1>Crear evaluación</h1>
        <form @submit.prevent="handleSubmit">
            <div class="my-5">
                <label for="title">Titulo de la prueba</label>
                <input type="text" class="text-field" v-model="title" />
            </div>
            <div class="my-3 flex justify-between">
                <h3>Preguntas</h3>
                <button
                    @click="addQuestion"
                    type="button"
                    class="btn btn-primary"
                >
                    Agregar
                </button>
            </div>
            <div
                v-for="(question, i) in questions"
                class="relative box mt-2 mb-10"
            >
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label for="title">Pregunta</label>
                        <div
                            @click="() => deleteQuestion(question)"
                            class="text-red-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-6 h-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                            </svg>
                        </div>
                    </div>
                    <div class="mb-4 md:flex items-center">
                        <input
                            type="text"
                            class="text-field w-full"
                            v-model="questions[i].title"
                            placeholder="Su pregunta"
                        />
                        <Listbox v-model="selectedType">
                            <div class="relative mt-3 md:mt-0 md:ml-5 md:w-4/12">
                                <ListboxButton
                                    class="btn btn-secondary !bg-white w-full"
                                    >{{ question.type }}</ListboxButton
                                >
                                <transition
                                    leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100"
                                    leave-to-class="opacity-0"
                                >
                                    <ListboxOptions
                                        class="z-50 absolute bg-white rounded-lg w-72 border shadow-sm mt-1"
                                    >
                                        <ListboxOption
                                            v-for="type in questionTypes"
                                            :key="type.id"
                                            :value="type"
                                            class="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                            @click="
                                                () =>
                                                    setQuestionType(
                                                        i,
                                                        type.type
                                                    )
                                            "
                                        >
                                            {{ type.type }}
                                        </ListboxOption>
                                    </ListboxOptions>
                                </transition>
                            </div>
                        </Listbox>
                    </div>

                    <!-- If the question type is multiple options -->
                    <div v-if="question.type == 'Multiple opción'">
                        <div class="flex justify-between items-end mt-10 mb-3">
                            <p>Opciones de respuesta:</p>
                            <button
                                type="button"
                                @click="() => addOption(question)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="w-6 h-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                        <!-- If there are no options -->
                        <div
                            class="box text-center text-sm h-20 !flex items-center justify-center"
                            v-if="!question.options?.length"
                        >
                            No hay opciones
                        </div>
                        <!-- If there are options -->
                        <div v-else>
                            <div v-for="(option, j) in question.options">
                                <div
                                    class="box !bg-white my-4 !flex justify-center flex-col"
                                >
                                    <input
                                        class="text-field"
                                        v-model="questions[i].options[j]"
                                    />
                                    <span
                                        class="text-xs mt-2 text-red-600 cursor-pointer"
                                        @click="
                                            () => deleteOption(question, option)
                                        "
                                        >Eliminar</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- If the question type is true or false -->
                    <div
                        v-if="question.type == 'Verdadero o falso'"
                        class="mt-10"
                    >
                        <div class="my-4 box !bg-white !py-4">Verdadero</div>
                        <div class="my-4 box !bg-white !py-4">Falso</div>
                    </div>

                    <!-- If the question type is open -->
                    <div v-if="question.type == 'Abierta'">
                        <div
                            class="box text-sm !flex items-center justify-center h-20"
                        >
                            Respuesta del estudiante
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="!questions.length"
                class="box !flex items-center justify-center h-32 mb-10"
            >
                No hay preguntas
            </div>
            <p v-if="error" class="text-red-600 mb-6">{{ error }}</p>
            <button class="btn btn-primary w-full -mb-10" :disabled="formLoading">
                <img src="/loading_white.svg" width="20" v-if="formLoading" />
                <span v-else>Crear Prueba</span>
            </button>
        </form>
    </div>
</template>
