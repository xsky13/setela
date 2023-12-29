<script setup>
import { ChevronLeftIcon, HomeIcon } from "@heroicons/vue/20/solid";

const props = defineProps(["home", "links"]);

const lastLink = props.links?.length ? props.links?.filter(link => link.last == true) : 0;
const linkToShowOnSmallScreen = ref(lastLink ? props.links[props.links?.indexOf(lastLink[0]) - 1] : 0);
</script>
<template>
    <div>
        <div class="hidden lg:flex overflow-x-scroll pb-6 text-gray-600">
            <NuxtLink to="/"><HomeIcon class="w-5 h-5" /></NuxtLink>
            <span class="mx-5 font-bold">/</span>
            <div v-for="link in props.links" class="flex items-center">
                <NuxtLink :to="link.to" class="font-bold text-sm">{{
                    link.text
                }}</NuxtLink>
                <span :class="`mx-5 font-bold ${link.last ? 'hidden' : ''}`"
                    >/</span
                >
            </div>
        </div>
        <div class="flex lg:hidden" v-if="lastLink">
            <div class="flex mb-6">
                <ChevronLeftIcon class="text-gray-600 h-5 w-5"/>
                <NuxtLink :to="linkToShowOnSmallScreen.to" class="font-bold text-sm text-gray-600 ml-1">{{ linkToShowOnSmallScreen.text }}</NuxtLink>
            </div>
        </div>
    </div>
</template>
