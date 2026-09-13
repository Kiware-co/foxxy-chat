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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SimpleDivider from '../../components/Divider/SimpleDivider.vue';

const FOXXY_SIGN_IN_URL = 'https://app.foxxy.pro/chat/entrar';
// Enlazado con :src y no escrito en el template: con una ruta absoluta estática en <img src>, el
// plugin de Vue la convierte en un import y el build de producción falla (Rollup no resuelve
// /brand-assets/…, que vive en public/). Es la misma forma que usa upstream en Logo.vue.
const FOXXY_LOGO_SRC = '/brand-assets/logo_thumbnail.svg';

const { t, locale } = useI18n();

const label = computed(() =>
  String(locale.value).toLowerCase().startsWith('es')
    ? 'Iniciar sesión con Foxxy'
    : 'Sign in with Foxxy'
);
</script>

<template>
  <div class="flex flex-col">
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
    <SimpleDivider :label="t('COMMON.OR')" class="uppercase" />
  </div>
</template>
