<script setup>
import Modal from "~/components/Modal.vue";
import { ref } from "vue";

const route = useRoute();
const supabase = useSupabaseClient();
const subject = ref();
const props = defineProps(["user"]);

const lessons = ref();
const lessonsLoading = ref(true);

const tests = ref();
const testsLoading = ref(false);
const deleteTestLoading = ref(false);

const testSubmissions = ref();

const deleteLessonModalRef = ref(null);
const lessonDeleteLoading = ref(false);

const { data: supaSubject } = await supabase
    .from("subject")
    .select()
    .eq("id", route.params.id)
    .single();

if (supaSubject) {
    subject.value = supaSubject;
}

/* GET LESSONS */
const { data: supaLessons } = await supabase
    .from("lesson")
    .select()
    .eq("subjectId", route.params.id);

if (supaLessons) {
    lessons.value = supaLessons;
    lessonsLoading.value = false;
}

/* GET TESTS */
const { data: supaTests } = await supabase
    .from("test")
    .select()
    .eq("subjectId", route.params.id);

if (supaTests) {
    tests.value = supaTests;
    testsLoading.value = false;
}

/** GET USER TEST SUBMISSIONS */
const { data: supabaseTestSubmissions } = await supabase
    .from("test_submission")
    .select()
    .eq("userId", props.user?.id);
if (supabaseTestSubmissions) testSubmissions.value = supabaseTestSubmissions;

const handleLessonDelete = async (modalNum, lessonId) => {
    lessonDeleteLoading.value = true;
    const { error } = await supabase.from("lesson").delete().eq("id", lessonId);

    // If there is an error: abort
    if (error) {
        alert(error);
        console.log(error);
        return;
    }

    // Otherwise close the modal and remve the loading state
    deleteLessonModalRef.value[modalNum].closeModal();
    lessonDeleteLoading.value = false;

    // Fetch the lessons again
    lessonsLoading.value = true;
    const { data: supaLessons } = await supabase
        .from("lesson")
        .select()
        .eq("subjectId", route.params.id);

    if (supaLessons) {
        lessons.value = supaLessons;
        lessonsLoading.value = false;
    }
};

const startTest = async (testId) => {
    // Show and hide the loading animation
    const loadingImg = document.getElementById("loading_delete_" + testId);
    const textStartTest = document.getElementById("test_start_" + testId);
    loadingImg.classList.remove("hidden");
    textStartTest.classList.add("hidden");

    const { data } = await supabase
        .from("test")
        .update({ started: true })
        .eq("id", testId);

    const { data: supaTests } = await supabase
        .from("test")
        .select()
        .eq("subjectId", route.params.id);

    if (supaTests) {
        tests.value = supaTests;
        testsLoading.value = false;
    }

    loadingImg.classList.add("hidden");
    textStartTest.classList.remove("hidden");
};

const endTest = async (testId) => {
    // Show and hide the loading animation
    const loadingImg = document.getElementById("loading_" + testId);
    const textStartTest = document.getElementById("test_start_" + testId);
    loadingImg.classList.remove("hidden");
    textStartTest.classList.add("hidden");

    const { data } = await supabase
        .from("test")
        .update({ started: false })
        .eq("id", testId);

    const { data: supaTests } = await supabase
        .from("test")
        .select()
        .eq("subjectId", route.params.id);

    if (supaTests) {
        tests.value = supaTests;
        testsLoading.value = false;
    }

    loadingImg.classList.add("hidden");
    textStartTest.classList.remove("hidden");
};

const deleteTest = async (testId) => {
    // Show and hide the loading animation
    const loadingImg = document.getElementById("loading_delete_" + testId);
    const deleteIcon = document.getElementById("delete_icon_" + testId);
    loadingImg.classList.remove("hidden");
    deleteIcon.classList.add("hidden");

    if (window.confirm("Está seguro que quiere borrar esta evaluación?")) {
        await supabase
            .from("test")
            .delete()
            .eq("id", testId)
            .then(async () => {
                testsLoading.value = true;

                const { data: supaTests } = await supabase
                    .from("test")
                    .select()
                    .eq("subjectId", route.params.id);

                if (supaTests) {
                    tests.value = supaTests;
                    testsLoading.value = false;
                }
                deleteTestLoading.value = false;
            });
    }
    loadingImg.classList.add("hidden");
    deleteIcon.classList.remove("hidden");
};

/** LINKS FOR BREADCRUMBS */

const { data: trimester } = await supabase
    .from("trimester")
    .select()
    .eq("id", subject.value.trimesterId)
    .single();

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

const { data: profesor } = subject.value.userId ? await supabase.from("profiles").select('full_name').eq('id', subject.value.userId).single() : { full_name: 'Esta materia no tiene profesor'}
</script>

<template>
    <div class="container">
        <Breadcrumbs
            :links="[
                { to: '/a/' + trimester.yearId, text: getYearText },
                {
                    to: '/a/' + trimester.yearId + '/trimestre/' + trimester.id,
                    text: trimester.title,
                },
                { to: '#', text: subject.title, last: true },
            ]"
        />
        <h1 v-if="!subject.id">No existe este periodo</h1>
        <div v-else>
            <h1>{{ subject.title }}</h1>
            <p v-if="profesor">Profesor: {{ profesor?.full_name }}</p>
            <p v-else>Esta materia no tiene profesor</p>
            <div
                v-if="subject.userId === props.user?.id || props.user.admin"
                class="flex justify-between items-center h3 mt-16 mb-2"
            >
                <h3>Clases</h3>
                <NuxtLink
                    :to="`./${route.params.id}/crear-clase`"
                    class="btn btn-primary"
                    >Crear Clase</NuxtLink
                >
            </div>
            <div v-else>
                <h3 class="h3 mt-6 mb-2">Clases</h3>
            </div>

            <!-- All lessons -->
            <img
                v-if="lessonsLoading"
                src="/loading.svg"
                class="block m-auto mt-10 w-40"
            />
            <div v-else>
                <div
                    v-if="!lessons.length"
                    class="box my-5 text-center text-sm"
                >
                    <p class="py-12">Todavía no hay clases</p>
                </div>
                <div v-else class="mt-5">
                    <!-- <NuxtPage :page-key="route => route.fullPath" /> -->
                    <div v-for="(lesson, i) in lessons" class="box mb-8">
                        <NuxtLink :to="route.fullPath + '/clases/' + lesson.id">
                            {{ lesson.title }}
                        </NuxtLink>

                        <div class="flex w-full justify-between">
                            <span class="text-gray-600 text-sm">
                                {{
                                    new Intl.DateTimeFormat("es-AR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }).format(new Date(lesson.created_at))
                                }}
                            </span>
                            <div
                                v-if="
                                    subject.userId === props.user?.id ||
                                    props.user.admin
                                "
                                class="flex items-center justify-center"
                            >
                                <Modal
                                    text="Borrar"
                                    title="Borrar Clase"
                                    class="text-red-600 cursor-pointer text-sm"
                                    :condition="true"
                                    ref="deleteLessonModalRef"
                                >
                                    <p class="py-4">
                                        Esta seguro que quiere borrar la clase
                                        '{{ lesson.title }}'? Esta acción es
                                        irreversible y todos los elementos
                                        asociados con esta clase van a ser
                                        eliminados.
                                    </p>
                                    <button
                                        class="btn btn-danger w-full"
                                        @click="
                                            () =>
                                                handleLessonDelete(i, lesson.id)
                                        "
                                    >
                                        <img
                                            v-if="lessonDeleteLoading"
                                            src="/loading_white.svg"
                                            width="20"
                                            alt="cargando..."
                                        />
                                        <span v-else>Borrar Clase</span>
                                    </button>
                                </Modal>
                                <div>
                                    <NuxtLink
                                        class="text-blue-600 text-sm cursor-pointer inline-block ml-3"
                                        :to="`./${route.params.id}/clases/${lesson.id}/editar`"
                                        >Editar</NuxtLink
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-20">
                <div class="flex items-end justify-between">
                    <h3>Evaluaciones</h3>
                    <NuxtLink
                        :to="`./${route.params.id}/evaluacion/crear`"
                        class="btn btn-secondary"
                        v-if="
                            props.user?.id == subject.userId || props.user.admin
                        "
                        >Crear Evaluación</NuxtLink
                    >
                </div>
                <img
                    v-if="testsLoading"
                    src="/loading.svg"
                    class="block m-auto mt-10 w-40"
                />
                <div v-else>
                    <div
                        v-if="!tests.length"
                        class="box text-sm text-center mt-4"
                    >
                        <p class="py-12">Todavía no hay evaluaciones</p>
                    </div>
                    <div v-else>
                        <div
                            class="box !flex justify-between my-4"
                            v-for="test in tests"
                        >
                            <div>
                                <NuxtLink
                                    :to="`./${route.params.id}/evaluacion/${test.id}`"
                                    >{{ test.title }}</NuxtLink
                                >
                                <div
                                    v-if="!props.user?.profesor"
                                    class="text-gray-600"
                                >
                                    <div
                                        v-if="
                                            testSubmissions.filter(
                                                (submission) =>
                                                    submission.testId == test.id
                                            ).length
                                        "
                                    >
                                        <div
                                            v-if="
                                                testSubmissions.filter(
                                                    (submission) =>
                                                        submission.testId ==
                                                        test.id
                                                )[0].graded
                                            "
                                            class="text-sm"
                                        >
                                            Evaluación entregada •
                                            <span class="font-bold text-sm"
                                                >{{
                                                    testSubmissions.filter(
                                                        (submission) =>
                                                            submission.testId ==
                                                            test.id
                                                    )[0].score
                                                }}%</span
                                            >
                                        </div>
                                        <div v-else class="text-sm">
                                            Su entrega esta siendo evaluada
                                        </div>
                                    </div>
                                    <div v-else>
                                        <span
                                            class="text-sm"
                                            v-if="test.started"
                                            >Evaluación abierta</span
                                        >
                                        <span class="text-sm" v-else
                                            >Evaluación cerrada</span
                                        >
                                    </div>
                                </div>
                                <div
                                    class="text-gray-600"
                                    v-if="
                                        subject.userId == props.user?.id ||
                                        props.user?.admin
                                    "
                                    :id="`test_start_${test.id}`"
                                >
                                    <span
                                        class="text-sm cursor-pointer"
                                        v-if="test.started"
                                        @click="() => endTest(test.id)"
                                        >Terminar evaluación</span
                                    >
                                    <span
                                        class="text-sm cursor-pointer"
                                        v-if="!test.started"
                                        @click="() => startTest(test.id)"
                                        >Comenzar evaluación</span
                                    >
                                <img
                                    src="/loading_gray.svg"
                                    :id="`loading_${test.id}`"
                                    class="hidden w-6"
                                />
                                </div>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">{{
                                    new Intl.DateTimeFormat("es-AR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }).format(new Date(test.created_at))
                                }}</span>
                                <br />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    :id="`delete_icon_${test.id}`"
                                    class="p-1 bg-white shadow-sm hover:shadow-md transition duration-150 rounded-md w-7 h-7 text-red-600 cursor-pointer float-right"
                                    v-if="
                                        (subject.userId === props.user?.id ||
                                            props.user.admin) &&
                                        !deleteTestLoading
                                    "
                                    @click="() => deleteTest(test.id)"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                                <img
                                    :id="`loading_delete_${test.id}`"
                                    src="/loading_gray.svg"
                                    class="w-6 hidden float-right"
                                    alt="cargando..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
