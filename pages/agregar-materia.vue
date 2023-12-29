<script setup>
import Loading from "../components/Loading";
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/vue";
import { CheckIcon, ChevronLeftIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

const stage = ref("year");
const props = defineProps(["user"]);

const subjects = ref([
    // First year
    [
        //First trimester
        ["Introducción General al AT", "Homilética I", "Fuente Biblicas"],
        // second trimester
        ["Hermenéutica Bíblica (DE)", "HOMILETICA II", "Arqueología Bíblica"],
        // third trimester
        ["PENTATEUCO", "Evangelismo Laico I (E. Personal)", "Ciencia Religión"],
    ],

    // Second year
    [
        // first trimester
        [
            "Libros Poéticos",
            "Evangelismo Laico II (E. Público)",
            "Libros históricos del AT ",
        ],
        // second trimester
        [
            "Historia de la Iglesia de la IASD",
            "Culto y Adoración",
            "Profetas I",
        ],
        // third trimester
        [
            "Liderazgo y Administración pastoral I",
            "Profetas II",
            "Ética Cristiana",
        ],
    ],

    // Third year
    [
        // first trimester
        [
            "Introducción General al NT",
            "Liderazgo y Administración Pastoral II",
            "Evangelios Sinópticos-Jn",
        ],
        // second trimester
        ["Epístolas I", "Aconsejamiento Pastoral I", "Epístolas II"],
        // third trimester
        ["Daniel", "Aconsejamiento Pastoral II", "Teología de la Salud"],
    ],

    // Fourth year
    [
        // first trimester
        ["Teología Sistemática I", "Apocalipsis", "Discipulado Cristiano"],
        // second trimester
        [
            "Teología Sistemática II",
            "Orientación Profética",
            "Plantación de Iglesias I",
        ],
        // third trimester
        [
            "Teología del Santuario",
            "Corrientes Teológicas Contemporáneas",
            "Teología del Santuario II",
        ],
    ],
]);
const years = ref(["Primer Año", "Segundo Año", "Tercer Año"]);
const selectedYear = ref(years.value[0]);
const trimesters = ref([
    {
        title: "Primer Trimestre",
        id: 1,
    },
    {
        title: "Segundo Trimestre",
        id: 2,
    },
    {
        title: "Tercer Trimestre",
        id: 3,
    },
]);
const selectedTrimester = ref(trimesters.value[0]);
const subjectsToChoose = ref(null);

const userSubjects = ref({});
const selectedSubject = ref();

const supabase = useSupabaseClient();

const requestLoading = ref(false);

setTimeout(() => {
    if (!props.user?.id) {
        window.location = "/";
    }
}, 15000);

const { data } = await supabase.from("subject").select();

if (data) {
    for (let i = 0; i < subjects.value.length; i++) {
        for (let j = 0; j < subjects.value[i].length; j++) {
            for (let k = 0; k < subjects.value[i][j].length; k++) {
                const subjectName = subjects.value[i][j][k];
                const subjectInfo = data.find(
                    (subject) => subject.title === subjectName
                );

                if (subjectInfo) {
                    subjects.value[i][j][k] = subjectInfo; // Replace string with object
                }
            }
        }
    }
}

const handleSubmit = async () => {
    // If we're in the year stage
    if (stage.value === "year") {
        let year;
        // Get the year
        switch (selectedYear.value) {
            case "Primer Año":
                year = 1;
                break;
            case "Segundo Año":
                year = 2;
                break;
            case "Tercer Año":
                year = 3;
                break;
            case "Cuarto Año":
                year = 3;
                break;
            default:
                break;
        }
        // Set the year in the object
        userSubjects.value.year = year;
        // Change the stage
        stage.value = "trimester";
    } else if (stage.value === "trimester") {
        // Set the trimester to the selected one
        userSubjects.value.trimester = selectedTrimester.value.id;
        // Change the stage
        stage.value = "subject";

        const subjectGroup =
            subjects.value[userSubjects.value.year - 1][
                userSubjects.value.trimester - 1
            ];

        // Set the subjects that the user can choose
        subjectsToChoose.value = subjectGroup;
        // Set the value of the selected subject so that the user can choose
        selectedSubject.value = subjectGroup[0];
    } else if (stage.value === "subject") {
        userSubjects.value.subject = selectedSubject.value;
        requestLoading.value = true;

        try {
            const user = await supabase
                .from("profiles")
                .update({ profesor: true })
                .eq("id", props.user.id)
                .select();

            if (user) {
                await supabase
                    .from("subject")
                    .update({ userId: props.user.id })
                    .eq("id", userSubjects.value.subject.id);
            }
        } catch (error) {
            console.log(error);
        } finally {        
            requestLoading.value = false;
            navigateTo("/");
        }
    }
};
</script>
<template>
    <div>
        <div v-if="props.user?.profesor" class="container">
            <div class="flex mb-6">
                <ChevronLeftIcon class="text-gray-600 h-5 w-5"/>
                <NuxtLink to="../" class="font-bold text-sm text-gray-600 ml-1">Atras</NuxtLink>
            </div>
            <h1>Agregar materia</h1>

            <form @submit.prevent="handleSubmit" class="my-5">
                <p v-if="stage === 'year'">En que año enseña?</p>
                <p v-if="stage === 'trimester'">En que trimestre enseña?</p>
                <p v-if="stage === 'subject'">Que materia enseña?</p>
                <Listbox v-model="selectedYear" v-if="stage == 'year'">
                    <div class="relative mt-1">
                        <ListboxButton
                            class="w-full rounded-lg py-2 pl-3 pr-10 text-left focus:outline-none border border-dashed bg-gray-100"
                        >
                            <span class="block truncate">{{
                                selectedYear
                            }}</span>
                            <span
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                            >
                                <ChevronUpDownIcon
                                    class="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </ListboxButton>

                        <transition
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <ListboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-md ring-1 ring-gray-500 ring-opacity-5 focus:outline-none sm:text-sm"
                            >
                                <ListboxOption
                                    v-slot="{ active, selected }"
                                    v-for="year in years"
                                    :key="year.name"
                                    :value="year"
                                    as="template"
                                >
                                    <li
                                        class="relative cursor-pointer select-none py-3 pl-10 pr-4 hover:bg-gray-50"
                                    >
                                        <span
                                            :class="selected && 'font-bold'"
                                            >{{ year }}</span
                                        >
                                        <span
                                            v-if="selected"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3"
                                        >
                                            <CheckIcon
                                                class="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
                <Listbox
                    v-model="selectedTrimester"
                    v-if="stage == 'trimester'"
                >
                    <div class="relative mt-1">
                        <ListboxButton
                            class="w-full rounded-lg py-2 pl-3 pr-10 text-left focus:outline-none border border-dashed bg-gray-100"
                        >
                            <span class="block truncate">{{
                                selectedTrimester.title
                            }}</span>
                            <span
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                            >
                                <ChevronUpDownIcon
                                    class="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </ListboxButton>

                        <transition
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <ListboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-md ring-1 ring-gray-500 ring-opacity-5 focus:outline-none sm:text-sm"
                            >
                                <ListboxOption
                                    v-slot="{ active, selected }"
                                    v-for="trimester in trimesters"
                                    :key="trimester.title"
                                    :value="trimester"
                                    as="template"
                                >
                                    <li
                                        class="relative cursor-pointer select-none py-3 pl-10 pr-4 hover:bg-gray-50"
                                    >
                                        <span
                                            :class="selected && 'font-bold'"
                                            >{{ trimester.title }}</span
                                        >
                                        <span
                                            v-if="selected"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3"
                                        >
                                            <CheckIcon
                                                class="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
                <Listbox v-model="selectedSubject" v-if="stage == 'subject'">
                    <div class="relative mt-1">
                        <ListboxButton
                            class="w-full rounded-lg py-2 pl-3 pr-10 text-left focus:outline-none border border-dashed bg-gray-100"
                        >
                            <span class="block truncate">{{
                                selectedSubject.title
                            }}</span>
                            <span
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                            >
                                <ChevronUpDownIcon
                                    class="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </ListboxButton>

                        <transition
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <ListboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-md ring-1 ring-gray-500 ring-opacity-5 focus:outline-none sm:text-sm"
                            >
                                <ListboxOption
                                    v-slot="{ active, selected }"
                                    v-for="subject in subjectsToChoose"
                                    :key="subject"
                                    :value="subject"
                                    as="template"
                                    :disabled="subject.userId"
                                >
                                    <li
                                        class="relative cursor-pointer select-none py-3 pl-10 pr-4 hover:bg-gray-50"
                                    >
                                        <span
                                            :class="selected && 'font-bold'"
                                            >{{ subject.title }}</span
                                        >
                                        <div
                                            v-if="subject.userId"
                                            class="text-xs text-gray-600"
                                        >
                                            Esta materia ya tiene profesor
                                        </div>
                                        <span
                                            v-if="selected"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3"
                                        >
                                            <CheckIcon
                                                class="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
                <button class="my-6 btn btn-primary">
                    <img
                        src="/loading_white.svg"
                        class="block m-auto"
                        width="20"
                        v-if="requestLoading"
                    />
                    <span v-else>Siguiente</span>
                </button>
            </form>
        </div>
        <div v-else>
            <h1 class="text-center py-40">No tiene permisos para acceder a esta página</h1>
        </div>
    </div>
</template>
