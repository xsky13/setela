<script setup>
const props = defineProps(["user"]);
const subjectData = ref([]);
const loading = ref(true);

const supabase = useSupabaseClient();

const { data: subjects } = await supabase
    .from("subject")
    .select()
    .eq("userId", props.user.id);
if (subjects.length) {
    for (const subject of subjects) {
        const { data: subjectTrimesters } = await supabase
            .from("trimester")
            .select("id, title, yearId")
            .eq("id", subject.trimesterId)
            .single();

        if (subjectTrimesters) {
            const { data: subjectYear } = await supabase
                .from("year")
                .select("id, title")
                .eq("id", subjectTrimesters.yearId)
                .single();

            subjectData.value.push({
                subject,
                trimester: subjectTrimesters,
                year: subjectYear,
            });
            loading.value = false;
        }
    }
} else {
    loading.value = false;
}

// subjects
const subjectRef = ref(null);

const removeSubject = async (subjectId, subjectElementNumber) => {
    subjectRef.value[subjectElementNumber].deleteSubjectModalRef.closeModal();
    loading.value = true;

    await supabase
        .from("subject")
        .update({ userId: null })
        .eq("id", subjectId)
        .select()
        .single()
        .then(async () => {
            subjectData.value = [];
            const { data: subjects } = await supabase
                .from("subject")
                .select()
                .eq("userId", props.user.id);
            if (subjects.length) {
                for (const subject of subjects) {
                    const { data: subjectTrimesters } = await supabase
                        .from("trimester")
                        .select("id, title, yearId")
                        .eq("id", subject.trimesterId)
                        .single();

                    if (subjectTrimesters) {
                        const { data: subjectYear } = await supabase
                            .from("year")
                            .select("id, title")
                            .eq("id", subjectTrimesters.yearId)
                            .single();

                        subjectData.value.push({
                            subject,
                            trimester: subjectTrimesters,
                            year: subjectYear,
                        });
                        loading.value = false;
                    }
                }
            }

            loading.value = false;
        });
};
</script>
<template>
    <img v-if="loading" src="/loading.svg" class="block m-auto w-20 py-6" />
    <div v-else>
        <div
            v-if="!subjectData.length"
            class="rounded-lg bg-gray-50 border border-dashed px-6 py-4 my-5"
        >
            <span class="font-medium text-center"
                >Todavia no tienes una materia</span
            >
        </div>
        <div v-else>
            <Subject
                ref="subjectRef"
                v-for="(subject, i) in subjectData"
                :subject="subject"
                :subjectElementNumber="i"
                :removeSubject="removeSubject"
            />
        </div>
    </div>
</template>
