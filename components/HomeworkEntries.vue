<script setup>
import Entry from "./Entry.vue";

const props = defineProps(["homework", "user", "userIsProfesor"]);
const supabase = useSupabaseClient();
const entriesLoading = ref(true);
const entries = ref();
const entryRef = ref();

const getEntries = async () => {
    entriesLoading.value = true;
    const { data: supabaseEntries } = await supabase
        .from("homework_entry")
        .select()
        .eq("homeworkId", props.homework?.id);

    if (entries) {
        entries.value = supabaseEntries;
        entriesLoading.value = false;
    }
};

await getEntries();

const userDidNotaAddEntry = ref(true);

const checkForUserEntry = () => {
    if (
        entries.value.filter((entry) => entry.userId == props.user?.id).length
    ) {
        userDidNotaAddEntry.value = false;
    } else {
        userDidNotaAddEntry.value = true;
    }
};

checkForUserEntry();

const addHomeworkEntryFormLoading = ref(false);
const addHomeworkEntryRef = ref(null);
const homeworkFile = ref();

const deleteEntry = async (entryNum, entryId) => {
    entryRef.value[entryNum].modalLoading = true;

    await supabase.from("homework_entry").delete().eq("id", entryId);

    entryRef.value[entryNum].deleteEntryModalRef.closeModal();
    entryRef.value[entryNum].modalLoading = false;

    await getEntries();
    checkForUserEntry();
};

const addHomeworkEntry = async (homeworkId, homeworkContent) => {
    addHomeworkEntryFormLoading.value = true;

    if (homeworkFile.value) {
        await supabase.storage
            .from("homework_entry_material")
            .upload(homeworkFile.value.name, homeworkFile.value, {
                cacheControl: "3600",
                upsert: true,
            })
            .then(async (res) => {
                await supabase
                    .from("homework_entry")
                    .insert({
                        homeworkId,
                        text: homeworkContent,
                        userId: props.user?.id,
                        link:
                            "https://qbcqrbsridxcnypqtyqn.supabase.co/storage/v1/object/public/homework_entry_material/" +
                            homeworkFile.value.name,
                        linkName: homeworkFile.value.name,
                    })
                    .then(async () => {
                        await getEntries();

                        checkForUserEntry();
                        addHomeworkEntryRef.value.closeModal();
                        addHomeworkEntryFormLoading.value = false;
                    });
            })
            .catch((err) => console.log(err));
    } else {
        await supabase
            .from("homework_entry")
            .insert({
                homeworkId,
                text: homeworkContent,
                userId: props.user?.id,
                link: "#",
                linkName: "No hay",
            })
            .then(async () => {
                await getEntries();

                checkForUserEntry();
                addHomeworkEntryRef.value.closeModal();
                addHomeworkEntryFormLoading.value = false;
            });
    }
};

const gradeHomework = async (homeworkId, grade, entryNum) => {
    entryRef.value[entryNum].gradeHomeworkModalLoading = true;

    console.log(homeworkId, grade);

    await supabase
        .from("homework_entry")
        .update({ grade })
        .eq("id", homeworkId)
        .then((res) => {
            console.log(res);
        });

    entryRef.value[entryNum].gradeHomeworkModalLoading = true;
    entryRef.value[entryNum].gradeHomeworkModalRef.closeModal();

    await getEntries();
};
</script>
<template>
    <div>
        <img
            v-if="entriesLoading"
            src="/loading.svg"
            class="w-20 block m-auto py-6"
            alt="cargando..."
        />
        <div v-else>
            <div v-if="!(props.user?.admin || props.user?.profesor)">
                <Modal
                    :condition="userDidNotaAddEntry"
                    title="Subir entrega"
                    text="Agregar entrega"
                    class="btn btn-primary mb-4 ml-6 float-right"
                    width="w-7/12"
                    ref="addHomeworkEntryRef"
                >
                    <div class="my-6">
                        <label for="file_upload">Archivo:</label>
                        <input
                            @change="(e) => (homeworkFile = e.target.files[0])"
                            type="file"
                            name="file_upload"
                            class="text-field"
                        />
                    </div>
                    <div class="my-6">
                        <label for="text">Contenido <em>(opcional)</em></label>
                        <textarea name="text" class="text-field"></textarea>
                    </div>
                    <button
                        @click="
                            (e) =>
                                addHomeworkEntry(
                                    props.homework?.id,
                                    e.target.previousElementSibling?.children[1].value
                                )
                        "
                        :disabled="addHomeworkEntryFormLoading"
                        class="btn btn-primary w-full"
                    >
                        <img
                            v-if="addHomeworkEntryFormLoading"
                            src="/loading_white.svg"
                            width="20"
                        />
                        <span v-else>Subir</span>
                    </button>
                </Modal>
            </div>
            <div class="">{{ props.homework?.content }}</div>

            <br clear="all" />
            <br v-if="!(props.user.admin || props.user.profesor)" />
            <span
                class="font-bold"
                v-if="props.user.admin || props.user.profesor"
                >Entregas:</span
            >
            <div
                v-if="
                    !entries.length && (props.user.admin || props.user.profesor)
                "
                class="box my-4"
            >
                <p class="py-4 text-center text-sm">No hay entregas</p>
            </div>
            <div v-else class="-my-4">
                <Entry
                    v-for="(entry, i) in entries"
                    :entry="entry"
                    :user="props.user"
                    :deleteEntry="deleteEntry"
                    :userIsProfesor="props.userIsProfesor"
                    :entryNumber="i"
                    ref="entryRef"
                    :gradeHomework="gradeHomework"
                />
            </div>
        </div>
    </div>
</template>
