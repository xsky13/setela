<script setup>
import AdminSubject from "./AdminSubject.vue";
const props = defineProps(["user"]);

const supabase = useSupabaseClient();
const loading = ref(true);
const subjectRef = ref();

const subjects = ref([]);

const { data: supaSubjects } = await supabase
    .from("subject")
    .select()
    .order("id", { ascending: true });

if (supaSubjects) {
    for (const subject of supaSubjects) {
        let name = "";

        if (subject?.userId) {
            const { data: subjectUser } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", subject.userId)
                .single();

            if (subjectUser) name = subjectUser.full_name;
        }

        subjects.value.push({ ...subject, loading: false, name: name });
    }
}

if (subjects) loading.value = false;

const addProfesorStatus = async (subjectId, elementIndex) => {
    subjects.value[elementIndex].loading = true;

    const { data: subjectToChangeProfesor } = await supabase
        .from("subject")
        .select()
        .eq("id", subjectId)
        .single();

    if (subjectToChangeProfesor) {
        await supabase
            .from("subject")
            .update({ userId: props.user.id })
            .eq("id", subjectId)
            .then(() => {
                subjects.value[elementIndex].loading = false;
                subjects.value[elementIndex].name = props.user.full_name;
            });
    }
};
</script>

<template>
    <h3 class="mt-16">Todas las materias</h3>

    <img src="/loading.svg" width="60" class="block m-auto" v-if="loading" />
    <div v-else>
        <AdminSubject
            v-for="(subject, i) in subjects"
            ref="subjectRef"
            :elementIndex="i"
            :addProfesorStatus="addProfesorStatus"
            :subject="subject"
        />
    </div>
</template>
