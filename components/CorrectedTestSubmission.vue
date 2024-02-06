<script setup>
const props = defineProps(["testSubmission", "getCorrectedTestSubmissions", "getTestSubmissions"]);

const testSubmission = ref(props.testSubmission);
const markAsUncorrectedModalRef = ref();
const markAsUncorrectedLoading = ref(false);
const supabase = useSupabaseClient();

// console.log(testSubmission.value);

const { data: user } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", testSubmission.value.userId)
    .single();

const markAsUncorrected = async (testSubmission, modalNum) => {
    markAsUncorrectedLoading.value = true;
    await supabase
        .from("test_submission")
        .update({ graded: false })
        .eq("id", testSubmission.id)
        .then(async () => {
            markAsUncorrectedLoading.value = false;
            markAsUncorrectedModalRef.value[modalNum].isOpen = false;

            await props.getCorrectedTestSubmissions();
            await props.getTestSubmissions();
        });
};
</script>

<template>
    <div class="box my-8 first:mt-3 md:!flex items-center justify-between">
        <span
            >Evaluación de
            {{ user.full_name }}
            •
            <span class="text-gray-600 font-bold"
                >{{ testSubmission.score }}%</span
            ></span
        >
        <Modal
            text="Marcar como no evaluada"
            title="Marcar evaluación como no evaluada"
            class="btn btn-primary mt-3 w-full md:w-auto md:mt-0"
            :condition="true"
            ref="markAsUncorrectedModalRef"
        >
            <p class="my-2">
                Al marcar esta evaluación como no evaluada, todas las
                correciones van a ser perdidas. Esta segur que quiere proceder?
            </p>
            <button
                class="btn btn-primary w-full mt-2"
                @click="() => markAsUncorrected(testSubmission, i)"
            >
                <img
                    v-if="markAsUncorrectedLoading"
                    src="/loading_white.svg"
                    width="20"
                    alt="loading..."
                />
                <span v-else>Marcar como no evaluada</span>
            </button>
        </Modal>
    </div>
</template>
