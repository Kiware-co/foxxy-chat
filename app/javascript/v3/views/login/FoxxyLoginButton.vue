<script setup>
// FOXXY: boton «Iniciar sesion con Foxxy» del login (spec 073 de olympus-ms-front, ticket
// Kiware-co/olympus-ms-front 219). Vive en un fichero PROPIO para que un rebase sobre upstream no
// conflictue: en Index.vue solo hay tres lineas FOXXY: que lo importan y lo pintan.
//
// Lleva al panel de Foxxy, que con la sesion de la persona (o pidiendosela) pide la URL de entrada
// SSO de siempre (POST /me/chat-session) y vuelve aqui ya dentro. El destino es FIJO y sin
// parametros: el panel ignora cualquiera y solo abre entradas a chat.foxxy.pro. Enlace normal en la
// misma ventana, como el de Google: dentro de la PWA, window.open abriria otra ventana.
//
// El texto no va en los JSON de locale de Chatwoot: son de upstream y se reescriben en cada version.
//
// Spec 093 (opcion B): debajo del boton, «Entrar con un codigo» abre FoxxyCodeSignIn.vue en su
// lugar. El boton de la opcion A se mantiene: sirve en escritorio y a quien no tiene la app.
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SimpleDivider from '../../components/Divider/SimpleDivider.vue';
import FoxxyCodeSignIn from './FoxxyCodeSignIn.vue';

const FOXXY_SIGN_IN_URL = 'https://app.foxxy.pro/chat/sign-in';
// Enlazado con :src y no escrito en el template: con una ruta absoluta estática en <img src>, el
// plugin de Vue la convierte en un import y el build de producción falla (Rollup no resuelve
// /brand-assets/…, que vive en public/). Es la misma forma que usa upstream en Logo.vue.
const FOXXY_LOGO_SRC = '/brand-assets/logo_thumbnail.svg';

const { t, locale } = useI18n();

const isSpanish = computed(() =>
  String(locale.value).toLowerCase().startsWith('es')
);

const label = computed(() =>
  isSpanish.value ? 'Iniciar sesión con Foxxy' : 'Sign in with Foxxy'
);

const codeLabel = computed(() =>
  isSpanish.value
    ? 'Entrar con un código de la app de Foxxy'
    : 'Sign in with a code from the Foxxy app'
);

const showCodeSignIn = ref(false);
</script>

<template>
  <div class="flex flex-col">
    <FoxxyCodeSignIn v-if="showCodeSignIn" @cancel="showCodeSignIn = false" />
    <template v-else>
      <a
        :href="FOXXY_SIGN_IN_URL"
        class="inline-flex justify-center w-full px-4 py-3 bg-n-background dark:bg-n-solid-3 items-center rounded-md shadow-sm ring-1 ring-inset ring-n-container dark:ring-n-container focus:outline-offset-0 hover:bg-n-alpha-2 dark:hover:bg-n-alpha-2"
      >
        <img
          :src="FOXXY_LOGO_SRC"
          alt=""
          aria-hidden="true"
          class="h-6 w-auto"
        />
        <span class="ml-2 text-base font-medium text-n-slate-12">
          {{ label }}
        </span>
      </a>
      <button
        type="button"
        class="mt-3 text-sm text-link self-center"
        data-testid="foxxy-code-open"
        @click="showCodeSignIn = true"
      >
        {{ codeLabel }}
      </button>
    </template>
    <SimpleDivider :label="t('COMMON.OR')" class="uppercase" />
  </div>
</template>
