<script setup>
import AdminSubject from "./AdminSubject.vue";


const supabase = useSupabaseClient();
const props = defineProps(["user"]);
const subjects = ref([]);

const { data: supaSubjects } = await supabase
    .from("subject")
    .select()
    .eq("userId", props.user.id);

for (const subject of supaSubjects) {
    subjects.value.push({ ...subject, loading: false });
}

const removeSubject = async (subjectId, elementIndex) => {
    subjects.value[elementIndex].loading = true;

    const { data: subjectToChangeProfesor } = await supabase
        .from("subject")
        .select()
        .eq("id", subjectId)
        .single();

    if (subjectToChangeProfesor) {
        await supabase
            .from("subject")
            .update({ userId: null })
            .eq("id", subjectId)
            .then(() => {
                subjects.value[elementIndex].loading = false;
                subjects.value.splice(elementIndex, 1)
            });
    }
};
</script>

<template>
    <div class="my-20">
        <h3>Materias Personales</h3>
        <div v-if="subjects.length">
            <AdminSubject
                v-for="(subject, i) in subjects"
                :elementIndex="i"
                :adminIsProfesor="true"
                :subject="subject"
                :removeSubject="removeSubject"
            />
        </div>
        <div v-else class="box mt-4">
            <p class="text-center py-8">Todavía no tiene materias</p>
        </div>
    </div>
</template>
