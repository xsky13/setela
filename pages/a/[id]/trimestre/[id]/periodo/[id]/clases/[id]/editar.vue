<script setup>
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import { ArrowLeftIcon, ChevronLeftIcon } from "@heroicons/vue/20/solid";

const route = useRoute();
const props = defineProps(["user"]);

const supabase = useSupabaseClient();

const title = ref();
const formError = ref(null);
const formLoading = ref(false);
let editor = null;

const { data: lesson, error } = await supabase
    .from("lesson")
    .select()
    .eq("id", route.params.id)
    .single();

const subjectId = route.path.split("/")[6];
const { data: subject } = await supabase
    .from("subject")
    .select("userId")
    .single()
    .eq("id", subjectId);

onMounted(() => {
    title.value = lesson.title;

    editor = new EditorJS({
        holder: "editor",
        data: JSON.parse(lesson.content),
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

const handleSubmit = async () => {
    if (!title.value) {
        error.value = "El titulo no puede estar vacío";
    } else {
        formError.value = null;
        formLoading.value = true;

        editor
            .save()
            .then(async (outputData) => {
                console.log(outputData);
                await supabase
                    .from("lesson")
                    .update({
                        title: title.value,
                        content: outputData,
                    })
                    .eq('id', lesson.id)
                    .then(() => {
                        formLoading.value = false;

                        alert("Cambios subidos");
                        navigateTo("./");
                    });
            })
            .catch((err) => {
                console.log("Saving failed: ", err);
            });
    }
};
</script>

<template>
    <div>
        <h1 v-if="error" class="py-40 text-center">Esta clase no existe</h1>
        <div v-else class="container">
            <div class="flex mb-6">
                <ChevronLeftIcon class="text-gray-600 h-5 w-5"/>
                <NuxtLink to="./" class="font-bold text-sm text-gray-600 ml-1">Atras</NuxtLink>
            </div>
            <div v-if="subject.userId == props.user?.id || props.user.admin">
                <h1>Editar lección '{{ lesson.title }}'</h1>
                <form @submit.prevent="handleSubmit">
                    <div class="my-8">
                        <label>Título</label>
                        <input class="text-field" v-model="title" />
                    </div>

                    <div class="my-8">
                        <label for="content">Contenido</label>
                        <div class="text-field" id="editor"></div>
                    </div>


                    <p v-if="formError" class="text-red-600 mb-3">
                        {{ formError }}
                    </p>
                    <button class="btn btn-primary w-full">
                        <img
                            v-if="formLoading"
                            src="/loading_white.svg"
                            width="20"
                        />
                        <span v-else>Subir cambios</span>
                    </button>
                </form>
            </div>
            <div v-else>
                <h1 class="text-center">
                    Para editar esta clase tiene que ser profesor
                </h1>
            </div>
        </div>
    </div>
</template>
