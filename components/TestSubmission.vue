<script setup>

const props = defineProps(['testSubmission', 'deleteTestSubmission', 'deleteTestSubmissionLoading', 'testAnswers', 'getTestSubmissions', 'getCorrectedTestSubmissions']);
const testSubmission = props.testSubmission;

const supabase = useSupabaseClient();

const { data: user } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', testSubmission.userId)
    .single();

const currentlyCorrecting = ref({});

const correctTestSubmissionModalRef = ref(null)
const correctTestSubmissionLoading = ref(false);
const correctTestError = ref();
const openCorrectModal = (testSubmission, modalNum) => {
    // Remove all current errors
    correctTestError.value = "";

    // Open the corect modal
    correctTestSubmissionModalRef.value.isOpen = true;

    // Set the currently correcting test
    currentlyCorrecting.value.testSubmissionId = testSubmission.id;
    currentlyCorrecting.value.score = null;
    currentlyCorrecting.value.questionsAndAnswers = [];
};

const addCorrect = (answer) => {
    // Filter for all the items that don't have the same questions as this answer
    const questionExists = currentlyCorrecting.value.questionsAndAnswers.filter(
        (obj) => obj.question == answer.question
    );

    // If the question exists (if the question does not not exist)
    if (questionExists.length) {
        // Remove the item with the question
        currentlyCorrecting.value.questionsAndAnswers =
            currentlyCorrecting.value.questionsAndAnswers.filter(
                (obj) => obj.question != answer.question
            );
    }

    // Add the new items
    currentlyCorrecting.value.questionsAndAnswers.push({
        question: answer.question,
        answer: answer.answer,
        correct: true,
        id: answer.id,
    });
};

const addIncorrect = (answer) => {
    // Filter for all the items that don't have the same questions as this answer
    const questionExists = currentlyCorrecting.value.questionsAndAnswers.filter(
        (obj) => obj.question == answer.question
    );

    console.log(questionExists);
    // If the question exists (if the question does not not exist)
    if (questionExists.length) {
        // Remove the item with the question
        currentlyCorrecting.value.questionsAndAnswers =
            currentlyCorrecting.value.questionsAndAnswers.filter(
                (obj) => obj.question != answer.question
            );
    }

    // Add the new items
    currentlyCorrecting.value.questionsAndAnswers.push({
        question: answer.question,
        answer: answer.answer,
        incorrect: true,
        id: answer.id,
    });

    console.log(currentlyCorrecting.value.questionsAndAnswers);
};


const handleTestCorrection = async (answers, testSubmissionId, modalNum) => {
    if (
        answers.length !==
        currentlyCorrecting.value.questionsAndAnswers.length ||
        !currentlyCorrecting.value.score
    ) {
        correctTestError.value = "No ha completado todos los campos";
    } else {
        correctTestError.value = "";

        correctTestSubmissionLoading.value = true;

        // Mark each question as correct/incorrect
        for (const obj of currentlyCorrecting.value.questionsAndAnswers) {
            await supabase
                .from("test_answer")
                .update({ isCorrect: obj.correct || obj.incorrect })
                .eq("id", obj.id);
        }

        // Set the score of the test submission and mark it as graded
        await supabase
            .from("test_submission")
            .update({ score: currentlyCorrecting.value.score, graded: true })
            .eq("id", testSubmissionId)
            .then(async () => {
                correctTestSubmissionLoading.value = false;
                correctTestSubmissionModalRef.value.isOpen = false;

                await props.getTestSubmissions();
                await props.getCorrectedTestSubmissions();
            });
    }
};
</script>

<template>
    <div class="box !flex justify-between items-center my-7">
        <p class="!py-1">
            Entrega de
            {{ user.full_name }}
        </p>
        <div class="flex items-center">
            <Modal text="Borrar" :condition="true" :title="`Borrar entrega de ${testSubmission.user_name}`"
                class="text-red-600 mr-4" ref="deleteTestSubmissionModalRef">
                <p class="my-3">
                    Esta seguro que quiere borrar esta entrega? Esta acción es
                    irreversible.
                </p>
                <button @click="() => props.deleteTestSubmission(testSubmission.id, i)" class="btn btn-danger w-full">
                    <img v-if="props.deleteTestSubmissionLoading" width="20" src="/loading_white.svg" />
                    <span v-else>Borrar</span>
                </button>
            </Modal>
            <Modal text="Corregir" :condition="true" :title="`Corregir entrega de ${testSubmission.user_name}`"
                class="btn btn-primary ml-3" width="w-7/12" :openFunction="() => openCorrectModal(testSubmission, i)"
                ref="correctTestSubmissionModalRef">
                <div v-if="props.testSubmission.file_link">
                    <NuxtLink :to="props.testSubmission.file_link" target="_blank" class="inline-block mt-4 link">{{ props.testSubmission.file_link.split('/')[8] }}</NuxtLink>
                </div>
                <div v-else>
                    <div v-for="answer in props.testAnswers.filter(
                        (ans) => ans.testSubmissionId == testSubmission.id
                    )" class="my-8 first:mt-6">
                        <div class="flex justify-between items-end">
                            <span class="font-bold">
                                {{ answer.question }}
                            </span>
                            <!-- Correct/incorrect icons -->
                            <div class="flex">
                                <!-- Check if there is a question in the currentlyCorrecting array -->
                                <div v-if="currentlyCorrecting.questionsAndAnswers.filter(
                                    (qAndA) =>
                                        qAndA.question == answer.question
                                ).length
                                    " class="flex">
                                    <!-- If the item is correct -->
                                    <div v-if="currentlyCorrecting.questionsAndAnswers.filter(
                                        (qAndA) =>
                                            qAndA.question ==
                                            answer.question
                                    )[0].correct
                                        ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                            class="w-6 h-6 text-blue-600 cursor-pointer mr-2">
                                            <path fill-rule="evenodd"
                                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <!-- If it doesn't have the correct option, show the default check icon -->
                                    <div v-else>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor"
                                            class="w-6 h-6 mr-2 cursor-pointer text-blue-600"
                                            @click="() => addCorrect(answer)">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>

                                    <!-- If the items is incorrect show a checked x mark -->
                                    <div v-if="currentlyCorrecting.questionsAndAnswers.filter(
                                        (qAndA) =>
                                            qAndA.question ==
                                            answer.question
                                    )[0].incorrect
                                        ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                            class="w-6 h-6 cursor-pointer text-red-600">
                                            <path fill-rule="evenodd"
                                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <!-- Otherwise, show the default x mark -->
                                    <div v-else>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor"
                                            class="w-6 h-6 cursor-pointer text-red-600" @click="() => addIncorrect(answer)">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <!-- If there isn't, show unmarked icons -->
                                <div v-else class="flex">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor"
                                        class="w-6 h-6 mr-2 cursor-pointer text-blue-600" @click="() => addCorrect(answer)">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-6 h-6 cursor-pointer text-red-600"
                                        @click="() => addIncorrect(answer)">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="box !px-7 mt-1.5">
                            {{ answer.answer }}
                        </div>
                    </div>
                </div>
                <div class="my-8 md:flex items-center">
                    <label for="grade" class="md:w-40">Puntaje total:</label>
                    <input type="number" class="text-field md:ml-5" v-model="currentlyCorrecting.score" />
                </div>
                <button class="btn btn-primary w-full" @click="() =>
                        handleTestCorrection(
                            testAnswers.filter(
                                (ans) =>
                                    ans.testSubmissionId ==
                                    testSubmission.id
                            ),
                            testSubmission.id,
                            i
                        )
                    ">
                    <img v-if="correctTestSubmissionLoading" src="/loading_white.svg" width="20" />
                    <span v-else>Corregir entrega</span>
                </button>
                <p v-if="correctTestError" class="text-red-600 mt-2">
                    {{ correctTestError }}
                </p>
            </Modal>
        </div>
    </div>
</template>
