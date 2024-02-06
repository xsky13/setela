<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

const props = defineProps(["user", "inviteAsProfesor", "userNum"]);
const supabase = useSupabaseClient();

const years = ref([
    { text: "Primer Año", num: 1 },
    { text: "Segundo Año", num: 2 },
    { text: "Tercer Año", num: 3 },
    { text: "Cuarto Año", num: 4 },
]);
const selectedYear = ref(years.value[0]);

const user = ref(props.user);

const userLoading = ref(false);

const changeYearModalRef = ref();

defineExpose({ userLoading });

const inviteAsProfesor = async (userId) => {
    userLoading.value = true;

    const { data: userToUpdate, error } = await supabase
        .from("profiles")
        .update({ invitedAsProfesor: true })
        .eq("id", userId)
        .select();

    if (error) throw Error(error);

    if (userToUpdate) {
        console.log(userToUpdate);
        user.value = userToUpdate[0];
        userLoading.value = false;
    }
};

const removeInvitation = async (userId) => {
    userLoading.value = true;

    const { data: userToUpdate, error } = await supabase
        .from("profiles")
        .update({ invitedAsProfesor: false })
        .eq("id", userId)
        .select();

    if (error) throw Error(error);

    if (userToUpdate) {
        console.log(userToUpdate);
        user.value = userToUpdate[0];
        userLoading.value = false;
    }
};

const changeYear = async (userId, year) => {
    changeYearModalRef.value.closeModal();
    userLoading.value = true;

    const { data: userToUpdate } = await supabase
        .from("profiles")
        .update({ year })
        .eq("id", userId)
        .select()
        .single();

    if (userToUpdate) {
        user.value = userToUpdate;
        userLoading.value = false;
    }
};

const removeProfesor = async () => {
    if (
        window.confirm(
            "Esta seguro que quiere eliminar a este usuario como profesor?"
        )
    ) {
        userLoading.value = true;

        const { data: subjects } = await supabase
            .from("subject")
            .update({ userId: null })
            .eq("userId", user.value.id)
            .then(async () => {
                await supabase
                    .from("profiles")
                    .update({ profesor: false })
                    .eq("id", user.value.id)
                    .select()
                    .single()
                    .then((res) => {
                        user.value = res.data;
                        userLoading.value = false;
                    });
            });
    }
};

const deleteUser = async () => {
    if (
        confirm(
            "Esta seguro que quiere eliminar este usuario? Esta acción es irreversible"
        )
    ) {
        userLoading.value = true;

        await supabase
            .from("profiles")
            .delete()
            .eq("id", user.value.id)
            .then(() => {
                userLoading.value = false;
                user.value = null;
            });
    }
};
</script>

<template>
    <img
        v-if="userLoading"
        src="/loading.svg"
        class="w-20 block m-auto py-10"
    />
    <div
        v-else-if="user"
        class="w-full py-4 px-6 rounded-xl my-8 border border-dashed bg-gray-50 flex justify-between"
    >
        <div>
            <p class="font-medium">
                {{ user.full_name }}
                <span class="font-normal"
                    >• {{ user.profesor ? "profesor" : "estudiante" }}</span
                >
            </p>
            <span class="text-sm text-gray-600"
                >Año {{ user.year }}
                <span
                    class="text-sm text-gray-600"
                    v-if="user.invitedAsProfesor"
                    >• esperando aceptacion de invitación</span
                >
            </span>
            <Modal
                :condition="true"
                text="Cambiar de año"
                class="text-blue-600 text-sm"
                title="Cambiar año"
                ref="changeYearModalRef"
            >
                <div class="bg-gray-50 border border-dashed rounded-lg my-6">
                    <div
                        @click="() => (selectedYear = year)"
                        v-for="year in years"
                        :class="`${
                            selectedYear == year || 'bg-white'
                        } px-6 py-3 first:pt-4 last:pb-4 last:border-none text-sm border-b border-dashed cursor-pointer transition duration-150`"
                    >
                        {{ year.text }}
                    </div>
                </div>
                <button
                    class="btn btn-primary w-full mt-6"
                    @click="() => changeYear(user.id, selectedYear.num)"
                >
                    Cambiar
                </button>
            </Modal>
        </div>
        <Menu as="div" class="relative inline-block text-left">
            <MenuButton>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                    />
                </svg>
            </MenuButton>

            <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
            >
                <MenuItems
                    class="absolute z-50 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                >
                    <div class="px-1 py-1">
                        <MenuItem v-if="!user.profesor">
                            <div
                                v-if="!user.invitedAsProfesor"
                                @click.prevent="
                                    () =>
                                        inviteAsProfesor(
                                            user.id /*, props.userNum */
                                        )
                                "
                                class="cursor-pointer flex w-full items-center rounded-md px-4 py-2.5 hover:bg-gray-100 text-[0.95rem]"
                            >
                                Hacer profesor
                            </div>
                            <div
                                v-else
                                @click.prevent="
                                    () =>
                                        removeInvitation(
                                            user.id /*, props.userNum */
                                        )
                                "
                                class="cursor-pointer flex w-full items-center rounded-md px-4 py-2.5 hover:bg-gray-100 text-[0.95rem]"
                            >
                                Eliminar invitación
                            </div>
                        </MenuItem>
                        <MenuItem v-else>
                            <div
                                @click="removeProfesor"
                                class="cursor-pointer flex w-full items-center rounded-md px-4 py-2.5 hover:bg-gray-100 text-[0.95rem]"
                            >
                                Hacer estudiante
                            </div>
                        </MenuItem>
                        <MenuItem>
                            <div
                                @click="deleteUser"
                                class="text-red-600 cursor-pointer flex w-full items-center rounded-md px-4 py-2.5 hover:bg-gray-100 text-[0.95rem]"
                            >
                                Eliminar estudiante
                            </div>
                        </MenuItem>
                    </div>
                </MenuItems>
            </transition>
        </Menu>
    </div>
</template>
