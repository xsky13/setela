<script setup>
const route = useRoute();
const supabase = useSupabaseClient();
const trimesterExists = ref(null);
const trimester = ref();
const subjects = ref([]);
const profesorForSubject = ref([]);

// get year based on param id
const { data: supaTrimester } = await supabase
    .from("trimester")
    .select("id, title, yearId")
    .eq("id", route.params.id)
    .single();

if (!supaTrimester) {
    trimesterExists.value = false;
} else {
    // Set the trimester
    trimester.value = supaTrimester;
    trimesterExists.value = true;

    // Get the subjects
    const { data: supaSubjects } = await supabase
        .from("subject")
        .select()
        .eq("trimesterId", trimester.value.id);

    if (supaSubjects) {
        // set the subject
        subjects.value = supaSubjects;

        console.log(subjects.value);
        // get the subjects user
        for (const subject of subjects.value) {
            console.log("Subject: ", subject.userId);
            if (subject.userId) {
                const { data: subjectProfesor } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", subject.userId)
                    .single();

                if (subjectProfesor) {
                    subjects.value[subject.period - 1] = {
                        ...subject,
                        profesorName: subjectProfesor.full_name,
                    };
                }
            }
        }
    }
}

const { data: year } = await supabase
    .from("year")
    .select()
    .eq("id", trimester.value.yearId)
    .single();
</script>
<template>
    <div class="container">
        <Breadcrumbs
            :links="[
                { to: '/a/' + trimester.yearId, text: year.title },
                { to: '#', text: trimester.title, last: true },
            ]"
        />
        <h1 v-if="!trimesterExists" class="text-center">
            Este trimestre no existe
        </h1>
        <div v-else>
            <h1>{{ trimester.title }}</h1>
            <NuxtLink
                v-for="subject in subjects"
                :to="`./${route.params.id}/periodo/` + subject.id"
                class="box my-5"
            >
                <span>{{ subject.title }}</span>
                <br />
                <div class="text-sm text-gray-600">
                    Periodo #{{ subject.period }}
                    <span v-if="subject.profesorName" class="text-sm">
                        &nbsp; • &nbsp; Profesor: {{ subject.profesorName }}
                    </span>
                </div>
            </NuxtLink>
        </div>
    </div>
</template>
