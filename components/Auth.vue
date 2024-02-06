<script setup>
const supabase = useSupabaseClient();

const loading = ref(false);
const email = ref("");

const handleLogin = async () => {
    try {
        loading.value = true;
        const { error } = await supabase.auth.signInWithOtp({
            email: email.value,
        });
        if (error) {
            console.log(error, ' asdhjashj');
            throw error
        };
        alert("Ingrese a su correo para confirmar el mensaje de verificación");
    } catch (error) {
        console.log(error);
        alert(error.error_description || error.message);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div
        class="h-screen flex justify-center items-center bg-[url('/main-bg.jpg')]"
    >
    <form
        @submit.prevent="handleLogin"
        class="w-11/12 sm:w-9/12 lg:w-5/12 p-16 rounded-xl shadow-xl backdrop-blur-md"
    >
        <div class="text-white">
            <h1>Ingresar</h1>
            <div class="my-5">
                <label for="email" class="mt-5">
                    Ingrese su correo electrónico para recibir una verificación
                </label>
                <input
                    class="mt-1 text-field !bg-transparent focus:!outline-none"
                    type="email"
                    id="email"
                    placeholder="Correo electrónico"
                    v-model="email"
                />
            </div>
            <button class="btn btn-primary">
                <img v-if="loading" src="/loading_white.svg" class="block m-auto" width="20" alt="loading..." />
                <span v-else>Ingresar</span>
            </button>
        </div>
    </form>
    </div>

</template>
