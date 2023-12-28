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
    <div class="container">
        <h1 class="text-center" v-if="!testExists">Esta prueba no existe</h1>
        <div v-else>
            <!-- {{ userSubmitedTest }} -->
            <div v-if="userSubmitedTest && !props.user.profesor">
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
                                    <TestSubmission
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
                                        :testSubmission="testSubmission"
                                        :deleteTestSubmission="deleteTestSubmission"
                                        :deleteTestSubmissionLoading="deleteTestSubmissionLoading"
                                        :testAnswers="testAnswers"
                                        :get-test-submissions="getTestSubmissions"
                                        :get-corrected-test-submissions="getCorrectedTestSubmissions"
                                    />
                                    <div v-else class="box mt-6">
                                        <p class="text-center py-6 md:py-12">
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
                                            <CorrectedTestSubmission :get-test-submissions="getTestSubmissions" :get-corrected-test-submissions="getCorrectedTestSubmissions" :testSubmission="testSubmission" />
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