<script setup>
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    HomeIcon,
} from "@heroicons/vue/20/solid";

const props = defineProps(["home", "links"]);
const route = useRoute();

const routeIsYear = route.name.split("-").length == 2;

const lastLink = props.links?.length
    ? props.links?.filter((link) => link.last == true)
    : 0;
const linkToShowOnSmallScreen = ref(
    lastLink
        ? !routeIsYear
            ? props.links[props.links?.indexOf(lastLink[0]) - 1]
            : { to: "/", text: "Atras" }
        : 0
);

const fontThickness = computed(() => {
    const isSafari =
        navigator.vendor &&
        navigator.vendor.indexOf("Apple") > -1 &&
        navigator.userAgent &&
        navigator.userAgent.indexOf("CriOS") == -1 &&
        navigator.userAgent.indexOf("FxiOS") == -1;

    if (isSafari) return "font-medium";
    return "font-bold";
});
</script>
<template>
    <div>
        <div class="hidden lg:flex overflow-x-scroll pb-6 text-gray-600">
            <NuxtLink to="/"><HomeIcon class="w-5 h-5" /></NuxtLink>
            <div v-for="link in props.links" class="flex items-center">
                <span :class="`mx-5 ${fontThickness}`">
                    <ChevronRightIcon class="text-gray-600 h-5 w-5" />
                </span>
                <NuxtLink :to="link.to" class="font-bold text-sm">{{
                    link.text
                }}</NuxtLink>
            </div>
        </div>
        <div class="flex lg:hidden" v-if="lastLink">
            <div class="flex mb-6">
                <ChevronLeftIcon class="text-gray-600 h-5 w-5" />
                <NuxtLink
                    :to="linkToShowOnSmallScreen.to"
                    :class="`${fontThickness} text-sm text-gray-600 ml-1`"
                    >{{ linkToShowOnSmallScreen.text }}</NuxtLink
                >
            </div>
        </div>
    </div>
</template>
