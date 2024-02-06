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

const route = useRoute();

</script>

<template>
    <div
        class="w-10/12 md:w-9/12 lg:w-7/12 fixed z-[101] left-[50%]"
        style="transform: translate(-50%, 0)"
    >
        <nav
            :class="`${
                route.path == '/' && !props.user
                    ? 'bg-transparent backdrop-blur-md text-white'
                    : 'bg-white'
            } w-full flex justify-between items-center py-6`"
        >
            <NuxtLink to="/" class="heading text-3xl">Setela</NuxtLink>
            <ul class="hidden md:flex items-center">
                <li class="mx-5">Contactar</li>
                <div v-if="props.user" class="ml-5 text-right">
                    <button
                        to="./"
                        @click="signOut"
                        class="text-red-600 cursor-pointer text-base"
                    >
                        <img
                            v-if="loading"
                            src="/loading_white.svg"
                            width="20"
                            alt="loading..."
                        />
                        <span v-else class="text-[0.95rem]">Borrar Sesión</span>
                    </button>
                </div>
            </ul>
            <Menu as="div" class="md:hidden relative inline-block text-left">
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
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
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
                        class="absolute z-[102] right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                    >
                        <div class="px-1 py-1">
                            <MenuItem>
                                <NuxtLink
                                    to="/contactar"
                                    class="flex w-full items-center rounded-md px-4 py-2.5 hover:bg-gray-100 text-[0.95rem]"
                                >
                                    Contactar
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
                                    <span v-else class="text-[0.95rem]"
                                        >Borrar Sesión</span
                                    >
                                </button>
                            </MenuItem>
                        </div>
                    </MenuItems>
                </transition>
            </Menu>
        </nav>
        <div class="fixed w-[200%] border-dashed left-[-50%] border-b"></div>
    </div>
</template>
