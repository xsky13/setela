<script setup>
import edjsHTML from "editorjs-html";
const edjsParser = edjsHTML();

const route = useRoute();
const props = defineProps(["user"]);

const supabase = useSupabaseClient();

const materiales = ref([]);
const materialLoading = ref(true);

const deleteMaterialModal = ref(null);
const deleteMaterialLoading = ref(false);

const files = ref([]);
const filesFormLoading = ref(false);
const addMaterialModal = ref(null);

const deleteLessonModalRef = ref(null);
const deleteLessonLoading = ref(false);

const homeworkContent = ref();

const { data: lesson, error } = await supabase
    .from("lesson")
    .select()
    .eq("id", route.params.id)
    .single();

const subjectId = route.path.split("/")[6];
const { data: subject } = await supabase
    .from("subject")
    .select("userId, title, id")
    .single()
    .eq("id", subjectId);

const fetchMaterials = async () => {
    materialLoading.value = true;
    const { data: supabaseMateriales } = await supabase
        .from("material")
        .select()
        .eq("lessonId", lesson.id);

    materiales.value = supabaseMateriales;
    materialLoading.value = false;
};

if (lesson) {
    await fetchMaterials();
}

// homework
const homeworkFormLoading = ref(false);
const homeworkModalRef = ref(null);
const homeworkLoading = ref(true);
const homework = ref();
const homeworkFiles = ref();

const deleteHomeworkLoading = ref(false);
const deleteHomeworkModalRef = ref(null);

const deleteHomework = async (hwId, elementIndex) => {
    deleteHomeworkLoading.value = true;

    await supabase
        .from("homework")
        .delete()
        .eq('id', hwId)
        .then(async () => {
            await getHomework();
            
            deleteHomeworkLoading.value = true;
            deleteHomeworkModalRef.value[elementIndex].closeModal();
        })
}


const getHomework = async () => {
    const { data: supabaseHomework } = await supabase
        .from("homework")
        .select()
        .eq("lessonId", lesson.id);

    if (supabaseHomework) {
        homeworkLoading.value = false;
        homework.value = supabaseHomework;
    }
};

await getHomework();

const createHomework = async () => {
    homeworkFormLoading.value = true;

    await supabase.storage
        .from("homework_files")
        .upload(homeworkFiles.value.name, homeworkFiles.value, {
            cacheControl: "3600",
            upsert: true
        }).then(async (res) => {
            if (res.error) {
                homeworkFormLoading.value = false;
                alert('El nombre de su archivo tiene caracteres invalidos')
            } else {
                await supabase
                    .from("homework")
                    .insert({ content: homeworkContent.value, lessonId: lesson.id, file_link: 'https://qbcqrbsridxcnypqtyqn.supabase.co/storage/v1/object/public/homework_files/' + homeworkFiles.value.name, file_name: homeworkFiles.value.name })
                    .then(async () => {
                        await getHomework();

                        homeworkFormLoading.value = false;
                        homeworkModalRef.value.closeModal();
                    });
            }
        })
};

const handleMaterialDelete = async (modalNum, materialId) => {
    deleteMaterialLoading.value = true;

    await supabase
        .from("material")
        .delete()
        .eq("id", materialId)
        .then(async () => {
            await fetchMaterials();

            deleteMaterialLoading.value = false;
            deleteMaterialModal.value[modalNum].closeModal();
        });
};

const deleteLesson = async () => {
    deleteLessonLoading.value = true;

    await supabase
        .from("lesson")
        .delete()
        .eq("id", lesson.id)
        .then(() => {
            deleteLessonModalRef.value.closeModal();
            deleteLessonLoading.value = false;

            navigateTo("../");
        });
};

/** FILES AND MATERIAL */
const addFile = (fileList) => {
    files.value = fileList;
};

const addMaterial = async () => {
    filesFormLoading.value = true;

    for (const file of files.value) {
        console.log(file);
        await supabase.storage
            .from("lesson_material")
            .upload(file.name, file, {
                cacheControl: "3600",
                upsert: false,
            })
            .then(async () => {
                await supabase.from("material").insert({
                    url:
                        "https://qbcqrbsridxcnypqtyqn.supabase.co/storage/v1/object/public/lesson_material/" +
                        file.name,
                    name: file.name,
                    lessonId: lesson.id,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    filesFormLoading.value = false;
    addMaterialModal.value.closeModal();

    await fetchMaterials();
};

const { data: trimester } = await supabase
    .from("trimester")
    .select()
    .eq("id", route.path.split('/')[4])
    .single();



const getYearText = computed(() => {
    if (trimester) {
        console.log(trimester);
        if (trimester.yearId == "1") {
            return "Primer año"
        } else if (trimester.yearId == "2") {
            return "Segundo año"
        } else if (trimester.yearId == "3") {
            return "Tercer año"
        } else if (trimester.yearId == "4") {
            return "Cuarto año"
        }
    }
});
</script>

<template>
    <div>
        <h1 v-if="error" class="py-40 text-center">Esta clase no existe</h1>
        <div v-else class="container">
            <Breadcrumbs :links="[
                { to: '/a/' + trimester.yearId, text: getYearText },
                { to: '/a/' + trimester.yearId + '/trimestre/' + trimester.id, text: trimester.title },
                { to: '/a/' + trimester.yearId + '/trimestre/' + trimester.id + '/periodo/' + subject.id, text: subject.title },
                { to: '#', text: lesson.title, last: true },
            ]" />
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <h1>{{ lesson.title }}</h1>
                    <span class="mt-1 text-gray-600">{{
                        new Intl.DateTimeFormat("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }).format(new Date(lesson.created_at))
                    }}</span>
                </div>
                <div class="flex items-center">
                    <NuxtLink v-if="subject.userId == props.user?.id || props.user.admin" :to="`./${lesson.id}/editar`"
                        class="text-blue-600 mr-6">
                        Editar
                    </NuxtLink>
                    <Modal :condition="subject.userId == props.user?.id || props.user.admin" text="Eliminar"
                        class="btn btn-danger" title="Eliminar clase" ref="deleteLessonModalRef">
                        <p class="py-6">
                            Esta seguro que quiere eliminar esta clase? Esta
                            acción es irreversible.
                        </p>
                        <button class="btn btn-danger w-full" @click="deleteLesson">
                            <img v-if="deleteLessonLoading" src="/loading_white.svg" width="20" />
                            <span v-else>Eliminar</span>
                        </button>
                    </Modal>
                </div>
            </div>
            <div class="mt-10" v-html="edjsParser.parseStrict(JSON.parse(lesson.content)).join(' ')
                "></div>

            <div class="flex justify-between items-end mt-12">
                <h3>Materiales</h3>
                <Modal :condition="subject.userId == props.user?.id || props.user.admin" text="Agregar Material"
                    class="btn btn-primary" title="Agregar material" width="w-7/12" ref="addMaterialModal">
                    <form @submit.prevent="addMaterial" class="mt-6">
                        <div>
                            <label for="add_material">Documento</label>
                            <input type="file" id="add_material" class="text-field" multiple
                                @change="(e) => addFile(e.target.files)" />
                        </div>

                        <button :disabled="filesFormLoading" class="btn btn-primary mt-8 w-full">
                            <img v-if="filesFormLoading" src="/loading_white.svg" width="20" />
                            <span v-else>Subir</span>
                        </button>
                    </form>
                </Modal>
            </div>
            <img v-if="materialLoading" class="w-20 block m-auto py-10" src="/loading.svg" />
            <div v-else>
                <div v-if="!materiales.length" class="box text-center mt-2">
                    <p class="py-8 text-sm">
                        No hay materiales para esta clase
                    </p>
                </div>
                <div v-else class="relative box my-6 whitespace-nowrap overflow-x-scroll"
                    v-for="(material, i) in materiales">
                    <NuxtLink :to="material.url" class="link">{{
                        material.name
                    }}</NuxtLink>
                    <Modal :condition="subject.userId == props.user?.id || props.user.admin"
                        class="text-sm !text-left text-red-600 cursor-pointer mt-2" title="Eliminar material"
                        text="Eliminar" ref="deleteMaterialModal">
                        <p class="py-6">
                            Esta seguro que quiere borrar este material? Esta
                            acción es irreversible
                        </p>
                        <button class="btn btn-danger w-full" @click="() => handleMaterialDelete(i, material.id)">
                            <img v-if="deleteMaterialLoading" src="/loading_white.svg" width="20" />
                            <span v-else>Eliminar</span>
                        </button>
                    </Modal>
                </div>
            </div>

            <div class="flex justify-between items-end mt-12">
                <h3>Trabajos Prácticos</h3>
                <Modal :condition="subject.userId == props.user?.id || props.user.admin" text="Agregar"
                    class="btn btn-primary" title="Agregar trabajo practico" width="w-7/12" ref="homeworkModalRef">
                    <form class="py-6" @submit.prevent="createHomework">
                        <div class="my-5">
                            <label for="file">Subir archivo</label>
                            <input type="file" @change="e => homeworkFiles = e.target.files[0]" id="file"
                                class="text-field" />
                        </div>
                        <label for="">Contenido</label>
                        <textarea v-model="homeworkContent" class="text-field h-32"></textarea>

                        <button class="btn btn-primary w-full mt-6">
                            <img v-if="homeworkFormLoading" src="/loading_white.svg" width="20" />
                            <span v-else>Subir</span>
                        </button>
                    </form>
                </Modal>
            </div>
            <div class="mt-2">
                <img v-if="homeworkLoading" src="/loading.svg" class="w-20 mt-16 block m-auto" />
                <div v-else>
                    <div v-if="!homework.length" class="box text-center">
                        <p class="py-12">No hay trabajos practicos</p>
                    </div>
                    <div v-else>
                        <div v-for="(hw, i) in homework" class="box my-6">
                            <HomeworkEntries :userIsProfesor="props.user?.id == subject.userId || props.user.admin"
                                :user="props.user" :homework="hw" />
                            <div class="flex justify-between items-center">
                                <Modal title="Eliminar trabajo práctico"
                                    :condition="props.user?.id == subject.userId || props.user.admin"
                                    class="text-red-600 text-sm" text="Eliminar trabajo práctico"
                                    ref="deleteHomeworkModalRef">
                                    <p class="my-4">Esta seguro que quiere eliminar este trabajo práctico?</p>
                                    <button @click="() => deleteHomework(hw.id, i)" class="btn w-full btn-danger">
                                        <img v-if="deleteHomeworkLoading" src="/loading_white.svg" width="20" />
                                        <span v-else>Eliminar</span>
                                    </button>
                                </Modal>
                                <div class="text-sm mt-1 text-gray-600">
                                    {{
                                        new Intl.DateTimeFormat("es-AR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }).format(new Date(hw.created_at))
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
