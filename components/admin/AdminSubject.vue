<script setup>
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

const props = defineProps([
    "subject",
    "addProfesorStatus",
    "elementIndex",
    "loading",
    "adminIsProfesor",
    "removeSubject",
	"lista"
]);
const supabase = useSupabaseClient();

const loading = ref(true);
const subjectProfesor = ref();
const profesorStatusLoading = ref(false);
const adminEsProfesor = computed(() => {
	const suser = useSupabaseUser();
	return props.subject.userId == suser.value.id;
});

const { data: trimester } = await supabase
    .from("trimester")
    .select()
    .eq("id", props.subject.trimesterId)
    .single();

if (trimester) loading.value = false;

// onMounted(() => {
// 	const suser = useSupabaseUser();
// 	if (props.subject.userId == suser.value.id) {
// 		adminEsProfesor.value = true;
// 	}
// })

// Set the subjects profesor if it exists
if (props.subject.userId) {
    const { data: subjectUser } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", props.subject.userId)
        .single();

    if (subjectUser) subjectProfesor.value = subjectUser;
}

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

const hacerAdminProfesorDeMateria = () => {
    props.addProfesorStatus(
        props.subject.id,
        props.elementIndex
    )
    // cambiar texto de boton
	adminEsProfesor.value = true;
}

const eliminarMateriaDeAdmin = () => {
                            props.removeSubject(
                                props.subject.id,
                                props.elementIndex
                            )

	adminEsProfesor.value = false;

}

defineExpose({ profesorStatusLoading, test: "hello" });
</script>

<template>
    <div v-if="loading" class="box my-8">
        <i>Cargando materia...</i>
    </div>
    <div v-else>
        <div class="box my-8 md:!flex justify-between items-start">
            <div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="font-medium text-sm text-blue-700">
                            {{ getYearText }}
                        </div>
                        <ChevronRightIcon
                            class="w-4 h-4 ml-2 mt-0.5 text-gray-600"
                        />
                        <div class="text-sm text-gray-600 ml-2">
                            {{ trimester.title }}
                        </div>
                    </div>
                </div>
                <NuxtLink
                    :to="`/a/${trimester.yearNumber}/trimestre/${trimester.id}/periodo/${props.subject.id}`"
                    class="inline-block mt-2"
                >
                    {{ props.subject?.title }}
                </NuxtLink>
                <div v-if="!props.adminIsProfesor">
                    <div
                        v-if="props.subject.name"
                        class="text-sm text-gray-600"
                    >
                        Profesor: {{ props.subject.name }}
                    </div>
                    <div v-else class="text-sm text-gray-600">
                        Esta materia no tiene profesor
                    </div>
                </div>
            </div>
            <button
                v-if="!props.adminIsProfesor"
                @click="hacerAdminProfesorDeMateria"
                type="button"
                :class="`btn btn-primary w-full mt-4 md:w-auto md:mt-0 ${adminEsProfesor && 'bg-gray-100'}`"
				:disabled="adminEsProfesor"
            >
                <img
                    v-if="props.subject.loading"
                    src="/loading_white.svg"
                    width="20"
                    alt="cargando..."
                />
                <span v-else>
					<span v-if="adminEsProfesor">Usted ya es profesor de esta materia</span>
					<span v-else>Hacerse profesor de materia </span>
				</span>
            </button>
            <div v-else>
				<button v-if="props.lista" class="btn btn-primary w-full mt-4 md:w-auto md:mt-0 bg-gray-100" disabled>
					Usted ya es profesor de esta materia
				</button>

                    <button
                        v-else
                        @click="eliminarMateriaDeAdmin"
                        type="button"
                        :class="`btn btn-primary w-full mt-4 md:w-auto md:mt-0 ${props.subject.loading && 'bg-gray-200'}`"
                        :disabled="props.subject.loading"
                    >
                        <img
                            v-if="props.subject.loading"
                            src="/loading_white.svg"
                            width="20"
                            alt="cargando..."
                        />
                        <span v-else>
                            Eliminar materia de materias personales
                        </span>
                    </button>
            </div>
        </div>
    </div>
</template>
