<script setup>
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";

const route = useRoute();
const subject = ref();
const props = defineProps(["user"]);

const error = ref(false);
const formLoading = ref(false);
const title = ref();
const files = ref([]);
const supabase = useSupabaseClient();

const filesInserted = ref(false);

/**FETCH DATA */
const { data: supaSubject } = await supabase
    .from("subject")
    .select()
    .eq("id", route.params.id)
    .single();

if (supaSubject) {
    subject.value = supaSubject;
}

let editor = null;

/** CREATE EDITOR */
onMounted(() => {
    editor = new EditorJS({
        holder: "editor",
        data: {},
        autofocus: true,

        tools: {
            header: {
                class: Header,
                toolbox: {
                    title: "Encabezado",
                },
                inlineToolbar: true,
            },
            list: {
                class: List,
                inlineToolbar: true,
                toolbox: {
                    title: "Lista",
                },
                inlineToolbar: true,
            },
            image: {
                class: ImageTool,
                inlineToolbar: true,
                config: {
                    uploader: {
                        async uploadByFile(image) {
                            const { data, error } = await supabase.storage
                                .from("lesson_images")
                                .upload(image.name, image, {
                                    cacheControl: "3600",
                                    upsert: false,
                                });

                            return {
                                success: 1,
                                file: {
                                    url:
                                        "https://qbcqrbsridxcnypqtyqn.supabase.co/storage/v1/object/public/lesson_images/" +
                                        image.name,
                                },
                            };
                        },
                    },
                },
            },
        },
        i18n: {
            messages: {
                ui: {
                    blockTune: {
                        textTune: {
                            "Add a link": "Agregar un enlace",
                            // Customize other UI messages as needed
                        },
                    },
                    inlineToolbar: {
                        converter: {
                            "Convert to": "Convertir a",
                        },
                    },
                    toolbar: {
                        // Customize toolbar buttons
                        Text: "Texto",
                    },
                },
            },
        },
    });
});

const addFile = (fileList) => {
    files.value = fileList;
};

const handleSubmit = async () => {
    if (!title.value) {
        error.value = "El titulo no puede estar vacío";
    } else {
        error.value = null;
        formLoading.value = true;

        // Save the editor contents
        editor
            .save()
            .then(async (outputData) => {
                // Create a lesson
                await supabase
                    .from("lesson")
                    .insert({
                        title: title.value,
                        content: outputData,
                        subjectId: subject.value.id,
                    })
                    .select()
                    .single()
                    .then(async (res) => {
                        // If there are files
                        if (files.value.length) {
                            // For each file upload it to the material bucket
                            for (const file of files.value) {
                                await supabase.storage
                                    .from("lesson_material")
                                    .upload(file.name, file)
                                    .then(async () => {
                                        console.log(res.data);
                                        // add the item to the material table
                                        await supabase
                                            .from("material")
                                            .insert({
                                                url:
                                                    "https://qbcqrbsridxcnypqtyqn.supabase.co/storage/v1/object/public/lesson_material/" +
                                                    file.name,
                                                name: file.name,
                                                lessonId: res.data.id,
                                            })
                                            .then(
                                                () =>
                                                    (filesInserted.value = true)
                                            );
                                    });
                            }

                            if (filesInserted.value) {
                                alert("Su clase ha sido creada");

                                // Remove the lesson loading state
                                formLoading.value = false;

                                navigateTo("./");
                            }
                        } else {
                            alert("Su clase ha sido creada");

                            // Remove the lesson loading state
                            formLoading.value = false;

                            navigateTo("./");
                        }
                    });
            })
            .catch((error) => {
                console.log("Saving failed: ", error);
            });
    }
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
</script>

<template>
    <div v-if="!subject">
        <h1 class="text-center py-40">Este periodo no existe</h1>
    </div>
    <div v-else class="container">
        <Breadcrumbs
            :links="[
                { to: '/a/' + trimester.yearId, text: getYearText },
                {
                    to: '/a/' + trimester.yearId + '/trimestre/' + trimester.id,
                    text: trimester.title,
                },
                {
                    to:
                        '/a/' +
                        trimester.yearId +
                        '/trimestre/' +
                        trimester.id +
                        '/periodo/' +
                        subject.id,
                    text: subject.title,
                },
                { to: '#', text: 'Crear clase', last: true },
            ]"
        />
        <div v-if="props.user.admin || props.user.profesor">
            <h1>Crear Clase</h1>
            <form @submit.prevent="handleSubmit" class="mt-4">
                <div class="mb-6">
                    <label for="title">Título</label>
                    <input
                        type="text"
                        id="title"
                        class="text-field"
                        v-model="title"
                    />
                </div>
                <div class="mb-6">
                    <label for="content">Contenido</label>
                    <div
                        id="editor"
                        class="border border-gray-300 rounded-lg shadow-sm px-6 py-3 overflow-scroll h-96 resize-y"
                    ></div>
                </div>
                <div class="mb-3">
                    <label for="file">Agregar archivo</label>
                    <input
                        type="file"
                        id="file"
                        class="text-field"
                        v-on:change="(e) => addFile(e.target.files)"
                        multiple
                    />
                </div>
                <p v-if="error" class="text-red-600 mb-3">
                    {{ error }}
                </p>
                <div>
                    <button class="btn btn-primary w-full">
                        <img
                            v-if="formLoading"
                            src="/loading_white.svg"
                            width="20"
                        />
                        <span v-else>Someter</span>
                    </button>
                </div>
            </form>
        </div>
        <div v-else>
            <h1 class="text-center">No tiene permisos para crear clases</h1>
        </div>
    </div>
</template>
