<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";

const supabase = useSupabaseClient();
const props = defineProps(["user", "name"]);
const loading = ref(false);

async function signOut() {
    try {
        loading.value = true;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        else window.location.reload();
    } catch (error) {
        alert(error.message);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <nav
        class="fixed z-50 bg-white w-full flex justify-around items-center border-dashed border-b bolder-black py-6"
    >
        <NuxtLink to="/" class="heading text-3xl">Setela</NuxtLink>
        <ul class="flex items-center">
            <li class="mx-5">Contactar</li>
            <div v-if="props.user" class="mx-5 text-right">
                <Menu as="div" class="relative inline-block text-left">
                    <MenuButton class="btn btn-primary w-full -center">
                        <span>{{ props.name }}</span>
                        <ChevronDownIcon
                            class="ml-1 -mt-0.5 w-6 h-6"
                            aria-hidden="true"
                        />
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
                                    <NuxtLink
                                        to="/profesor"
                                        class="flex w-full items-center rounded-md px-4 py-2.5 hover:bg-gray-100 text-[0.95rem]"
                                    >
                                        Profesorado
                                    </NuxtLink>
                                </MenuItem>
                                <MenuItem>
                                    <button
                                        to="./"
                                        @click="signOut"
                                        class="text-red-600 flex w-full items-center rounded-md px-4 pt-2.5 pb-3 text-xs hover:bg-gray-100"
                                    >
                                        <img
                                            v-if="loading"
                                            src="/loading_white.svg"
                                            width="20"
                                            alt="loading..."
                                        />
                                        <span v-else class="text-[0.95rem]">Borrar Sesión</span>
                                    </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>
        </ul>
    </nav>
</template>
