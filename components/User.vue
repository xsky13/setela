<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
const props = defineProps(["user", "inviteAsProfesor", "userNum"]);
const supabase = useSupabaseClient();

const user = ref(props.user);

const userLoading = ref(false);

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

const removeInvitation = async userId => {
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
}
</script>

<template>
    <img
        v-if="userLoading"
        src="/loading.svg"
        class="w-20 block m-auto py-10"
    />
    <div
        v-else
        class="w-full py-4 px-6 rounded-xl my-6 border border-dashed bg-gray-50 flex justify-between"
    >
        <div>
            <p class="font-bold">{{ user.full_name }}</p>
            <span class="text-sm text-gray-600"
                >Año {{ user.year }}
                <span
                    class="text-sm text-gray-600"
                    v-if="user.invitedAsProfesor"
                    >• esperando aceptacion de invitación</span
                >
            </span>
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
                    class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                >
                    <div class="px-1 py-1">
                        <MenuItem>
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
                    </div>
                </MenuItems>
            </transition>
        </Menu>
    </div>
</template>
