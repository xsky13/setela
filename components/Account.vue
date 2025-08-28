<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { ChevronDownIcon, PencilIcon } from "@heroicons/vue/20/solid";

const supabase = useSupabaseClient();

const pageLoading = ref(true);
const loading = ref(true);
const full_name = ref("");
const id = ref("");
const isAdmin = ref(false);
const isProfesor = ref(false);
const year = ref(1);
const avatar_path = ref("");
const header = ref("title");

const userYear = ref();
const trimesters = ref();
const periods = ref([]);

const editNameLoading = ref(false);

// List of users
const usersAdminAccess = ref([]);

const userElementRef = ref();

pageLoading.value = true;
const user = useSupabaseUser();

const { data } = await supabase
    .from("profiles")
    .select(
        `id, full_name, avatar_url, admin, profesor, year, invitedAsProfesor`
    )
    .eq("id", user.value.id)
    .single();

if (data) {
    full_name.value = data.full_name;
    isAdmin.value = data.admin;
    isProfesor.value = data.profesor;
    year.value = data.year;
    avatar_path.value = data.avatar_url;
    id.value = data.id;
}

pageLoading.value = false;

/** FETCH USER YEAR */
const { data: supabaseYear } = await supabase
    .from("year")
    .select()
    .eq("number", year.value)
    .single();

if (supabaseYear) {
    userYear.value = supabaseYear;
}

const { data: supabaseTrimesters } = await supabase
    .from("trimester")
    .select()
    .eq("yearId", year.value);
if (supabaseTrimesters) trimesters.value = supabaseTrimesters;

// Fetch periods
for (const trimester of trimesters.value) {
    const { data: supaSubjects } = await supabase
        .from("subject")
        .select()
        .eq("trimesterId", trimester.id)
        .order('id', { ascending: true })
    if (supaSubjects) periods.value.push(supaSubjects);
}

// If the current user is admin get all the users
if (isAdmin) {
    const { data } = await supabase
        .from("profiles")
        .select()
        .not("admin", "is", true);
    usersAdminAccess.value = data;
}

async function updateProfile() {
    try {
        editNameLoading.value = true;

        const updates = {
            id: user.value.id,
            full_name: full_name.value,
            avatar_url: avatar_path.value,
        };

        const { error } = await supabase.from("profiles").upsert(updates, {
            returning: "minimal", // Don't return the value after inserting
        });
        if (error) throw error;
        window.location.reload();
    } catch (error) {
        alert(error.message);
    } finally {
        editNameLoading.value = false;
    }
}

const changeHeaderContent = () => {
    if (header.value == "edit") {
        header.value = "title";
    } else {
        header.value = "edit";
    }
};

const inviteAsProfesor = async (userId, elementIndex) => {
    // userElementRef.value[elementIndex].userLoading = true;
    // console.log(userId);
    // const { data: userToUpdate, error } = await supabase
    //     .from("profiles")
    //     .update({ invitedAsProfesor: true })
    //     .eq("id", userId)
    //     .select()
    //     .maybeSingle()
    //     .catch(err => console.log(err));
    //     userElementRef.value[elementIndex].userLoading = false;
    //     console.log(userToUpdate);
    // if (userToUpdate) {
    //     console.log(userToUpdate);
    //     await supabase
    //         .from("profiles")
    //         .select(
    //             `id, full_name, avatar_url, admin, profesor, year, invitedAsProfesor`
    //         )
    //         .then((res) => {
    //             usersAdminAccess.value = res.data;
    //         })
    //         .catch(err => {
    //             console.log(err);
    //         });
    // }
    // if (error) {
    //     console.log(error);
    // }
};
</script>

<template>
    <img v-if="pageLoading" src="/loading.svg" class="block m-auto pt-40" />
    <div v-if="data?.full_name">
        <NuxtLink
            to="/profesor"
            class="box !py-2 !px-4 mb-10 link text-center"
            v-if="data.invitedAsProfesor && !data.profesor"
        >
            Invitación a profesorado
        </NuxtLink>

        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <h1 v-if="header == 'title'">Bienvenido/a {{ full_name }}</h1>
            <div v-if="header == 'edit'" class="">
                <form
                    class="flex items-stretch"
                    @submit.prevent="updateProfile"
                >
                    <input
                        id="name"
                        class="text-field"
                        type="text"
                        v-model="full_name"
                    />
                    <button class="btn btn-primary ml-2">
                        <img
                            v-if="editNameLoading"
                            src="/loading_white.svg"
                            width="20"
                            alt="loading..."
                        />
                        <span v-else>Someter</span>
                    </button>
                </form>
            </div>
            <button v-if="header == 'title'" @click="changeHeaderContent">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4 md:w-5 md:h-5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                </svg>
            </button>
            <button
                v-if="header == 'edit'"
                @click="changeHeaderContent"
                class="btn btn-secondary"
            >
                Cancelar
            </button>  
        </div>

        <div v-if="isAdmin">
            <Courses :user="{ id, full_name }" />
            <h3 class="h3 mt-6">Usuarios</h3>
            <div v-if="!usersAdminAccess.length" class="box mt-8">
                <p class="text-center p-6">
                    No hay usuarios todavía
                </p>
            </div>
            <User
                v-for="(user, i) in usersAdminAccess"
                ref="userElementRef"
                :user="user"
                :inviteAsProfesor="inviteAsProfesor"
                :userNum="i"
            />

            <AdminPersonalSubjects :user="data" />
            <AdminSubjects :user="data" />
        </div>

        <!-- User profesor -->
        <div v-else-if="isProfesor" class="my-10">
            <div class="flex justify-between items-center my-6">
                <h3 class="h3">Sus Materias</h3>
                <NuxtLink to="/agregar-materia" class="btn btn-primary"
                    >Agregar</NuxtLink
                >
            </div>
            <ProfesorSubjects :user="data" />
        </div>

        <!-- User student -->
        <div v-else class="my-10">
            <h3>{{ userYear.title }}</h3>
            <Disclosure
                v-for="(trimester, i) in trimesters"
                as="div"
                class="bg-gray-100 py-6 px-8 rounded-lg border border-dashed border-gray-300 my-8 first:-mt-10"
                :default-open="true"
            >
                <DisclosureButton
                    as="h4"
                    class="w-full inline-flex items-center justify-between font-bold cursor-pointer"
                >
                    {{ trimester.title }}
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
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </DisclosureButton>

                <!-- Use the built-in `transition` component to add transitions. -->
                <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-out"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                >
                    <DisclosurePanel>
                        <NuxtLink
                            v-for="(period, j) in periods"
                            :to="`a/${year}/trimestre/${trimester.id}/periodo/${periods[i][j].id}`"
                            class="box  my-6 first:mt-2"
                        >
                            Periodo #{{ periods[i][j].period }} • {{ periods[i][j].title }}
                        </NuxtLink>
                    </DisclosurePanel>
                </transition>
            </Disclosure>
        </div>
    </div>

    <div v-else class="block m-auto w-7/12">
        <h1>Termine su cuenta</h1>
        <form class="form-widget" @submit.prevent="updateProfile">
            <div class="mt-2 mb-5">
                <label for="email">Correo electrónico: </label>
                <input id="email" type="text" :value="user.email" disabled />
            </div>
            <div class="mb-5">
                <label for="name">Nombre: </label>
                <input
                    id="name"
                    class="text-field"
                    type="text"
                    v-model="full_name"
                />
            </div>
            <button class="btn btn-primary w-full">
                <img
                    v-if="editNameLoading"
                    src="/loading_white.svg"
                    width="20"
                    alt="loading..."
                />
                <span v-else>Completar</span>
            </button>
        </form>
    </div>
</template>
