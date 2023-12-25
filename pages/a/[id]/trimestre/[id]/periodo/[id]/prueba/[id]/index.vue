<script setup>
import { ref } from "vue";

const route = useRoute();
const supabase = useSupabaseClient();

const test = ref();
const testSubmissions = ref();
const testAnswers = ref([]);
const testSubmissionsLoading = ref(false);

const submissionLoading = ref(false);
const confirmSubmissionModal = ref(null);

const correctedTestSubmissions = ref([]);
const correctedTestSubmissionsLoading = ref(false);

const testExists = ref(true);
const questions = ref();
const questionOptions = ref();
const userAnswers = ref([]);

const props = defineProps(["user"]);

const deleteTestSubmissionModalRef = ref(null);
const deleteTestSubmissionLoading = ref(false);

const markAsUncorrectedModalRef = ref(null);
const markAsUncorrectedLoading = ref(null);

const correctTestSubmissionModalRef = ref(null);
const correctTestSubmissionLoading = ref(false);
const correctTestError = ref();
const currentlyCorrecting = ref({});

const finishTestLoading = ref(false);

const userSubmitedTest = ref();
/** DATA FETCHING */
const { data: supabaseTest } = await supabase
    .from("test")
    .select()
    .eq("id", route.params.id)
    .single();

if (supabaseTest) {
    testExists.value = true;
    test.value = supabaseTest;

    // Get the test questions
    const { data: supabaseQuestions } = await supabase
        .from("testquestion")
        .select()
        .eq("testId", test.value.id);

    if (supabaseQuestions) {
        questions.value = supabaseQuestions;
    }

    // Get the multiple options
    for (const question of questions.value) {
        if (question.type == "Multiple opción") {
            const { data: options } = await supabase
                .from("questionoption")
                .select()
                .eq("testQuestionId", question.id);

            if (options) {
                questionOptions.value = options;
            }
        }
    }
} else {
    testExists.value = false;
}

/** FETCHING TEST SUBMISSIONS */
const getTestSubmissions = async () => {
    testSubmissionsLoading.value = true;
    const { data: supabaseTestSubmissions } = await supabase
        .from("test_submission")
        .select()
        .eq("testId", test.value.id);
    if (supabaseTestSubmissions.length) {
        testSubmissions.value = supabaseTestSubmissions;
        testSubmissionsLoading.value = false;
    }

    testAnswers.value = [];

    /** FETCHING TEST ANSWERS */
    for (const testSubmission of testSubmissions.value) {
        const { data: answer } = await supabase
            .from("test_answer")
            .select()
            .eq("testSubmissionId", testSubmission.id);

        if (answer) {
            testAnswers.value.push(answer);
        }
    }
    testAnswers.value = testAnswers.value.flat();

    // if (testSubmissions.value.filter(submission => submission.userId == props.user?.id).length) {
    //     userSubmitedTest.value = true;
    // }

    // console.log(testSubmissions.value.filter(submission => submission.userId == props.user?.id));
};

const getCorrectedTestSubmissions = async () => {
    correctedTestSubmissionsLoading.value = true;
    const { data: supabaseCorrectedTestSubmissions } = await supabase
        .from("test_submission")
        .select()
        .eq("testId", test.value.id)
        .eq("graded", true);
    if (supabaseCorrectedTestSubmissions) {
        correctedTestSubmissions.value = supabaseCorrectedTestSubmissions;
        correctedTestSubmissionsLoading.value = false;
    }
};

await getTestSubmissions();
await getCorrectedTestSubmissions();

for (const submission of testSubmissions.value) {
    if (submission.userId == props.user?.id) {
        userSubmitedTest.value = submission;
    }
}

/** TEST MANAGEMENT */
const addOption = (questionId, question, questionType, content) => {
    const optionExists = userAnswers.value.filter(
        (obj) => obj.question == question
    );
    if (optionExists.length) {
        userAnswers.value = userAnswers.value.filter(
            (obj) => obj.question !== question
        );
        userAnswers.value.push({
            questionId,
            question,
            questionType,
            answer: content,
        });
    } else {
        userAnswers.value.push({
            questionId,
            question,
            questionType,
            answer: content,
        });
    }
};

/** HANDLE THE SUBMISSION OF A TEST */
const handleSubmit = async () => {
    submissionLoading.value = true;

    const { data: testSubmission } = await supabase
        .from("test_submission")
        .insert({
            userId: props.user?.id,
            testId: test.value.id,
            score: null,
            graded: false,
            user_name: props.user?.full_name,
        })
        .select()
        .single();

    if (testSubmission) {
        for (const answer of userAnswers.value) {
            await supabase
                .from("test_answer")
                .insert({
                    userId: props.user?.id,
                    testQuestionId: answer.questionId,
                    testSubmissionId: testSubmission.id,
                    isCorrect: null,
                    answer: answer.answer,
                    question: answer.question,
                })
                .then(() => {});
        }
    }

    navigateTo("../");
    submissionLoading.value = false;
};

const openCorrectModal = (testSubmission, modalNum) => {
    // Remove all current errors
    correctTestError.value = "";

    // Open the corect modal
    correctTestSubmissionModalRef.value[modalNum].isOpen = true;

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

const deleteTestSubmission = async (testSubmissionId, modalNum) => {
    // Set the loading state for the button
    deleteTestSubmissionLoading.value = true;

    // Delete the test submission
    await supabase
        .from("test_submission")
        .delete()
        .eq("id", testSubmissionId)
        .then(async () => {
            // Reload the test submissions
            await getTestSubmissions();
            // Close the modal
            deleteTestSubmissionModalRef.value[modalNum].closeModal();
            // Remove loading state for button
            deleteTestSubmissionLoading.value = false;
        });
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
                correctTestSubmissionModalRef.value[modalNum].isOpen = false;

                await getTestSubmissions();
                await getCorrectedTestSubmissions();
            });
    }
};

const markAsUncorrected = async (testSubmission, modalNum) => {
    markAsUncorrectedLoading.value = true;
    await supabase
        .from("test_submission")
        .update({ graded: false })
        .eq("id", testSubmission.id)
        .then(async () => {
            markAsUncorrectedLoading.value = false;
            markAsUncorrectedModalRef.value[modalNum].isOpen = false;

            await getCorrectedTestSubmissions();
            await getTestSubmissions();
        });
};

const finishTest = async (testId) => {
    finishTestLoading.value = true;
    await supabase
        .from("test")
        .update({ started: false })
        .eq("id", testId)
        .then(() => {
            finishTestLoading.value = false;
            navigateTo("../");
        });
};
</script>
<template>
    <div class="py-40 block m-auto w-7/12">
        <h1 class="text-center" v-if="!testExists">Esta prueba no existe</h1>
        <div v-else>
            <!-- {{ userSubmitedTest }} -->
            <div v-if="userSubmitedTest">
                <h1 class="text-center">Evaluación entregada</h1>
                <div v-if="userSubmitedTest.graded">
                    <div class="mt-4">
                        Porcentaje: {{ userSubmitedTest.score }}%
                    </div>

                    <div
                        v-for="answer in testAnswers.filter(
                            (ans) => ans.testSubmissionId == userSubmitedTest.id
                        )"
                        class="box !bg-white my-8"
                    >
                        <div class="flex items-center justify-between">
                            <span class="font-bold">{{ answer.question }}</span>
                            <span class="text-blue-600" v-if="answer.isCorrect"
                                >Correcto</span
                            >
                            <span class="text-red-600" v-else>Incorrecto</span>
                        </div>
                        <div class="box my-2">{{ answer.answer }}</div>
                    </div>
                </div>
                <div v-else>
                    <p class="text-center mt-2">
                        Su evalación esta en proceso para ser corregida
                    </p>
                </div>
            </div>
            <div v-else>
                <h1>{{ test.title }}</h1>
                <div v-if="!test.started" class="box mt-4 text-center">
                    <p class="py-10">Esta evaluación todavía no ha comenzado</p>
                </div>
                <div v-else>
                    <div v-if="test.userId == props.user?.id" class="mt-10">
                        <div class="flex items-center justify-between">
                            <h3 class="-mb-4">Entregas</h3>
                            <button
                                class="btn btn-secondary"
                                @click="() => finishTest(test.id)"
                            >
                                <img
                                    v-if="finishTestLoading"
                                    src="/loading.svg"
                                    width="20"
                                    alt="cargando..."
                                />
                                <span v-else class="text-sm"
                                    >Terminar evaluación</span
                                >
                            </button>
                        </div>
                        <div>
                            <img
                                v-if="testSubmissionsLoading"
                                src="/loading.svg"
                                width="60"
                                class="block m-auto mt-10"
                            />
                            <div v-else>
                                <div v-if="testSubmissions.length">
                                    <div
                                        v-if="
                                            testSubmissions.filter(
                                                (submission) =>
                                                    !submission.graded
                                            ).length
                                        "
                                        v-for="(
                                            testSubmission, i
                                        ) in testSubmissions.filter(
                                            (submission) => !submission.graded
                                        )"
                                    >
                                        <div
                                            class="box !flex justify-between items-center my-7"
                                        >
                                            <p class="!py-1">
                                                Entrega de
                                                {{ testSubmission.user_name }}
                                            </p>
                                            <div class="flex items-center">
                                                <Modal
                                                    text="Borrar"
                                                    :condition="true"
                                                    :title="`Borrar entrega de ${testSubmission.user_name}`"
                                                    class="text-red-600 mr-4"
                                                    ref="deleteTestSubmissionModalRef"
                                                >
                                                    <p class="my-3">
                                                        Esta seguro que quiere
                                                        borrar esta entrega?
                                                        Esta acción es
                                                        irreversible.
                                                    </p>
                                                    <button
                                                        @click="
                                                            () =>
                                                                deleteTestSubmission(
                                                                    testSubmission.id,
                                                                    i
                                                                )
                                                        "
                                                        class="btn btn-danger w-full"
                                                    >
                                                        <img
                                                            v-if="
                                                                deleteTestSubmissionLoading
                                                            "
                                                            width="20"
                                                            src="/loading_white.svg"
                                                        />
                                                        <span v-else
                                                            >Borrar</span
                                                        >
                                                    </button>
                                                </Modal>
                                                <Modal
                                                    text="Corregir"
                                                    :condition="true"
                                                    :title="`Corregir entrega de ${testSubmission.user_name}`"
                                                    class="btn btn-primary ml-3"
                                                    width="w-7/12"
                                                    :openFunction="
                                                        () =>
                                                            openCorrectModal(
                                                                testSubmission,
                                                                i
                                                            )
                                                    "
                                                    ref="correctTestSubmissionModalRef"
                                                >
                                                    <div
                                                        v-for="answer in testAnswers.filter(
                                                            (ans) =>
                                                                ans.testSubmissionId ==
                                                                testSubmission.id
                                                        )"
                                                        class="my-8 first:mt-6"
                                                    >
                                                        <div
                                                            class="flex justify-between items-end"
                                                        >
                                                            <span
                                                                class="font-bold"
                                                            >
                                                                {{
                                                                    answer.question
                                                                }}
                                                            </span>
                                                            <!-- Correct/incorrect icons -->
                                                            <div class="flex">
                                                                <!-- Check if there is a question in the currentlyCorrecting array -->
                                                                <div
                                                                    v-if="
                                                                        currentlyCorrecting.questionsAndAnswers.filter(
                                                                            (
                                                                                qAndA
                                                                            ) =>
                                                                                qAndA.question ==
                                                                                answer.question
                                                                        ).length
                                                                    "
                                                                    class="flex"
                                                                >
                                                                    <!-- If the item is correct -->
                                                                    <div
                                                                        v-if="
                                                                            currentlyCorrecting.questionsAndAnswers.filter(
                                                                                (
                                                                                    qAndA
                                                                                ) =>
                                                                                    qAndA.question ==
                                                                                    answer.question
                                                                            )[0]
                                                                                .correct
                                                                        "
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="currentColor"
                                                                            class="w-6 h-6 text-blue-600 cursor-pointer mr-2"
                                                                        >
                                                                            <path
                                                                                fill-rule="evenodd"
                                                                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                                                                clip-rule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <!-- If it doesn't have the correct option, show the default check icon -->
                                                                    <div v-else>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke-width="1.5"
                                                                            stroke="currentColor"
                                                                            class="w-6 h-6 mr-2 cursor-pointer text-blue-600"
                                                                            @click="
                                                                                () =>
                                                                                    addCorrect(
                                                                                        answer
                                                                                    )
                                                                            "
                                                                        >
                                                                            <path
                                                                                stroke-linecap="round"
                                                                                stroke-linejoin="round"
                                                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                            />
                                                                        </svg>
                                                                    </div>

                                                                    <!-- If the items is incorrect show a checked x mark -->
                                                                    <div
                                                                        v-if="
                                                                            currentlyCorrecting.questionsAndAnswers.filter(
                                                                                (
                                                                                    qAndA
                                                                                ) =>
                                                                                    qAndA.question ==
                                                                                    answer.question
                                                                            )[0]
                                                                                .incorrect
                                                                        "
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="currentColor"
                                                                            class="w-6 h-6 cursor-pointer text-red-600"
                                                                        >
                                                                            <path
                                                                                fill-rule="evenodd"
                                                                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                                                                                clip-rule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <!-- Otherwise, show the default x mark -->
                                                                    <div v-else>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke-width="1.5"
                                                                            stroke="currentColor"
                                                                            class="w-6 h-6 cursor-pointer text-red-600"
                                                                            @click="
                                                                                () =>
                                                                                    addIncorrect(
                                                                                        answer
                                                                                    )
                                                                            "
                                                                        >
                                                                            <path
                                                                                stroke-linecap="round"
                                                                                stroke-linejoin="round"
                                                                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <!-- If there isn't, show unmarked icons -->
                                                                <div
                                                                    v-else
                                                                    class="flex"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke-width="1.5"
                                                                        stroke="currentColor"
                                                                        class="w-6 h-6 mr-2 cursor-pointer text-blue-600"
                                                                        @click="
                                                                            () =>
                                                                                addCorrect(
                                                                                    answer
                                                                                )
                                                                        "
                                                                    >
                                                                        <path
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        />
                                                                    </svg>
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke-width="1.5"
                                                                        stroke="currentColor"
                                                                        class="w-6 h-6 cursor-pointer text-red-600"
                                                                        @click="
                                                                            () =>
                                                                                addIncorrect(
                                                                                    answer
                                                                                )
                                                                        "
                                                                    >
                                                                        <path
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            class="box !px-7 mt-1.5"
                                                        >
                                                            {{ answer.answer }}
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="my-8 md:flex items-center"
                                                    >
                                                        <label
                                                            for="grade"
                                                            class="md:w-40"
                                                            >Puntaje
                                                            total:</label
                                                        >
                                                        <input
                                                            type="number"
                                                            class="text-field md:ml-5"
                                                            v-model="
                                                                currentlyCorrecting.score
                                                            "
                                                        />
                                                    </div>
                                                    <button
                                                        class="btn btn-primary w-full"
                                                        @click="
                                                            () =>
                                                                handleTestCorrection(
                                                                    testAnswers.filter(
                                                                        (ans) =>
                                                                            ans.testSubmissionId ==
                                                                            testSubmission.id
                                                                    ),
                                                                    testSubmission.id,
                                                                    i
                                                                )
                                                        "
                                                    >
                                                        <img
                                                            v-if="
                                                                correctTestSubmissionLoading
                                                            "
                                                            src="/loading_white.svg"
                                                            width="20"
                                                        />
                                                        <span v-else
                                                            >Corregir
                                                            entrega</span
                                                        >
                                                    </button>
                                                    <p
                                                        v-if="correctTestError"
                                                        class="text-red-600 mt-2"
                                                    >
                                                        {{ correctTestError }}
                                                    </p>
                                                </Modal>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="box mt-6">
                                        <p class="text-center py-12">
                                            Todavía no hay entregas a esta
                                            prueba
                                        </p>
                                    </div>

                                    <h3 class="mb-2 mt-10">Evaluadas</h3>
                                    <img
                                        v-if="correctedTestSubmissionsLoading"
                                        src="/loading.svg"
                                        width="60"
                                        class="block m-auto mt-2"
                                        alt="loading..."
                                    />
                                    <div v-else>
                                        <div
                                            v-if="
                                                !correctedTestSubmissions.length
                                            "
                                            class="box text-center"
                                        >
                                            <p class="py-12">
                                                Todavía no ha corregido
                                                evaluaciones
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        v-if="!correctedTestSubmissionsLoading"
                                    >
                                        <div
                                            v-for="(
                                                testSubmission, i
                                            ) in correctedTestSubmissions"
                                        >
                                            <div
                                                class="box my-8 first:mt-3 !flex items-center justify-between"
                                            >
                                                <span
                                                    >Evaluación de
                                                    {{
                                                        testSubmission.user_name
                                                    }}
                                                    •
                                                    <span
                                                        class="text-gray-600 font-bold"
                                                        >{{
                                                            testSubmission.score
                                                        }}%</span
                                                    ></span
                                                >
                                                <Modal
                                                    text="Marcar como no evaluada"
                                                    title="Marcar evaluación como no evaluada"
                                                    class="btn btn-primary"
                                                    :condition="true"
                                                    ref="markAsUncorrectedModalRef"
                                                >
                                                    <p class="my-2">
                                                        Al marcar esta
                                                        evaluación como no
                                                        evaluada, todas las
                                                        correciones van a ser
                                                        perdidas. Esta segur que
                                                        quiere proceder?
                                                    </p>
                                                    <button
                                                        class="btn btn-primary w-full mt-2"
                                                        @click="
                                                            () =>
                                                                markAsUncorrected(
                                                                    testSubmission,
                                                                    i
                                                                )
                                                        "
                                                    >
                                                        <img
                                                            v-if="
                                                                markAsUncorrectedLoading
                                                            "
                                                            src="/loading_white.svg"
                                                            width="20"
                                                            alt="loading..."
                                                        />
                                                        <span v-else
                                                            >Marcar como no
                                                            evaluada</span
                                                        >
                                                    </button>
                                                </Modal>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <div
                            v-for="question in questions"
                            :class="`box ${
                                question.type == 'Abierta' || '!bg-white'
                            } my-8`"
                        >
                            {{ question.question }}
                            <div v-if="question.type == 'Multiple opción'">
                                <div
                                    v-for="option in questionOptions.filter(
                                        (option) =>
                                            option.testQuestionId == question.id
                                    )"
                                    class="my-2"
                                >
                                    <label
                                        :for="`option${question.id}`"
                                        class="box-radio-label"
                                        @click="
                                            () =>
                                                addOption(
                                                    question.id,
                                                    question.question,
                                                    question.type,
                                                    option.option
                                                )
                                        "
                                    >
                                        <input
                                            type="radio"
                                            :name="`option${question.id}`"
                                            class="box-radio"
                                        />
                                        <span class="box-radio-text">{{
                                            option.option
                                        }}</span>
                                    </label>
                                </div>
                            </div>
                            <div
                                v-else-if="question.type == 'Verdadero o falso'"
                            >
                                <label
                                    :for="`tof${question.id}`"
                                    class="box-radio-label my-2"
                                    @click="
                                        () =>
                                            addOption(
                                                question.id,
                                                question.question,
                                                question.type,
                                                'Verdadero'
                                            )
                                    "
                                >
                                    <input
                                        type="radio"
                                        :name="`tof${question.id}`"
                                        class="box-radio"
                                    />
                                    <span class="box-radio-text"
                                        >Verdadero</span
                                    >
                                </label>
                                <label
                                    :for="`tof${question.id}`"
                                    class="box-radio-label my-2"
                                    @click="
                                        () =>
                                            addOption(
                                                question.id,
                                                question.question,
                                                question.type,
                                                'Falso'
                                            )
                                    "
                                >
                                    <input
                                        type="radio"
                                        :name="`tof${question.id}`"
                                        class="box-radio"
                                    />
                                    <span class="box-radio-text">Falso</span>
                                </label>
                            </div>
                            <div v-else-if="question.type == 'Abierta'">
                                <textarea
                                    class="text-field h-32 mt-2"
                                    placeholder="Su respuesta"
                                    @keydown="
                                        (e) =>
                                            addOption(
                                                question.id,
                                                question.question,
                                                question.type,
                                                e.target.value
                                            )
                                    "
                                ></textarea>
                            </div>
                        </div>
                        <Modal
                            title="Confirmación de entrega"
                            text="Someter"
                            class="btn btn-primary w-full"
                            ref="confirmSubmissionModal"
                            :condition="true"
                        >
                            <p class="my-4">
                                Este es su único intento para entregar esta
                                evaluación
                            </p>
                            <button
                                @click="handleSubmit"
                                class="btn btn-primary w-full mt-2"
                            >
                                <img
                                    v-if="submissionLoading"
                                    src="/loading_white.svg"
                                    width="20"
                                    alt="cargando..."
                                />
                                <span class="text-sm" v-else>Confirmar</span>
                            </button>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>