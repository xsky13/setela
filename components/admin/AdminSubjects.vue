<script setup>
import { subjectStore } from "~/stores/subjects";
import AdminSubject from "./AdminSubject.vue";
const props = defineProps(["user"]);

const supabase = useSupabaseClient();
const loading = ref(true);
const subjectRef = ref();

const subjects = subjectStore.allSubjects;


const { data: supaSubjects } = await supabase
    .from("subject")
    .select()
    .order("id", { ascending: true });

if (supaSubjects) {
    // subjects.splice(0, subjects.length); 
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

        subjects.push({ ...subject, loading: false, name: name });
    }
}

if (subjects) loading.value = false;

const addProfesorStatus = async (subjectId, elementIndex) => {
    subjects[elementIndex].loading = true;

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
                subjects[elementIndex].loading = false;
                subjects[elementIndex].name = props.user.full_name;
                subjects[elementIndex].userId = props.user.id;
                subjects[elementIndex].name = props.user.full_name;
            });

        // eliminar materia de la lista
        // subjects.splice(elementIndex, 1);

        // emitir evento para que se acutalizen las materias personales en PersonalSubjects.vue
        // const emit = defineEmits(["update-personal-subjects"]);
        subjectStore.personalSubjects.push({
                    ...subjects[elementIndex],
                    loading: false
                });
        // emit('assigned', { subjectId: subject.id, subject: subject })


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
            :lista="true"
            :addProfesorStatus="addProfesorStatus"
            :subject="subject"
        />
    </div>
</template>
