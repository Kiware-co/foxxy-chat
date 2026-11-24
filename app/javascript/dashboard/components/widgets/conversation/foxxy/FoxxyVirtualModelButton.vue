<script setup>
// FOXXY: botón de la modelo virtual en la cabecera del chat (spec 211 de olympus-ms-back).
//
// Sólo aparece si el back dice que el buzón REAL del chat tiene modelo virtual encendida y que quien
// mira puede manejarla (super admin, admin, admin de la compañía, admin de la casa o asesor de la
// casa). Si el back no responde, o la persona no puede, no se pinta nada: el chat sigue como siempre.
//
// Verde «Virtual activa · Sacar» cuando la virtual contesta el chat; «Pasar a la modelo virtual» si no.
// El estado se vuelve a pedir al cambiar de chat y cuando cambia el estado del chat (pending/open).
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useAlert } from 'dashboard/composables';
import NextButton from 'dashboard/components-next/button/Button.vue';
import { callVirtualModel, FOXXY_API_BASE } from './foxxyVirtualModel';

const props = defineProps({
  chat: { type: Object, default: () => ({}) },
  accountId: { type: [Number, String], default: null },
  // Base de la API de Foxxy. Fija en producción; la prop existe para las pruebas.
  apiBase: { type: String, default: FOXXY_API_BASE },
});

const store = useStore();
const state = ref(null);
const busy = ref(false);

const token = computed(() => store.getters.getCurrentUser?.access_token);
const conversationId = computed(() => props.chat?.id);

const visible = computed(() => !!state.value?.available);
const active = computed(() => !!state.value?.active);
const modelName = computed(() => state.value?.model_name || 'la modelo virtual');

const label = computed(() =>
  active.value ? 'Virtual activa · Sacar' : 'Pasar a la modelo virtual'
);
const tooltip = computed(() =>
  active.value
    ? `Sacar a la modelo virtual: ${modelName.value} (virtual) está contestando este chat; pulsa para tomarlo tú.`
    : `Pasar a la modelo virtual: ${modelName.value} (virtual) contesta este chat.`
);

let requestSeq = 0;
async function refresh() {
  const seq = ++requestSeq;
  const result = await callVirtualModel({
    apiBase: props.apiBase,
    token: token.value,
    accountId: props.accountId,
    conversationId: conversationId.value,
  });
  if (seq !== requestSeq) return; // cambió de chat mientras tanto
  state.value = result.ok ? result.state : null;
}

async function toggle() {
  if (busy.value) return;
  busy.value = true;
  const action = active.value ? 'release' : 'take';
  const result = await callVirtualModel({
    apiBase: props.apiBase,
    token: token.value,
    accountId: props.accountId,
    conversationId: conversationId.value,
    action,
  });
  busy.value = false;
  if (!result.ok) {
    useAlert(result.message || 'No se pudo cambiar la modelo virtual. Intenta de nuevo.');
    return;
  }
  state.value = result.state;
  if (action === 'take') {
    useAlert(
      result.state?.queued
        ? 'Listo: la modelo virtual va a contestar el último mensaje.'
        : 'Listo: la modelo virtual contesta desde el próximo mensaje del cliente.'
    );
  } else {
    useAlert('Listo: el chat queda abierto para ti.');
  }
}

watch(
  () => [props.accountId, conversationId.value, props.chat?.status],
  () => {
    if (!props.accountId || !conversationId.value) {
      state.value = null;
      return;
    }
    refresh();
  },
  { immediate: true }
);
</script>

<template>
  <NextButton
    v-if="visible"
    v-tooltip.bottom="tooltip"
    sm
    :variant="active ? 'solid' : 'faded'"
    :color="active ? 'teal' : 'slate'"
    icon="i-lucide-bot"
    :label="label"
    :is-loading="busy"
    :disabled="busy"
    data-testid="foxxy-virtual-model-button"
    @click="toggle"
  />
</template>
