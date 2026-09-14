<script setup>
// FOXXY: entrar al chat con un código de un solo uso (spec 093 de olympus-ms-back, ticket
// Kiware-co/olympus-ms-back 197). Es la opción B del login con Foxxy: la persona no sale de
// chat.foxxy.pro. Escribe su correo, le llega un código por push a la app de Foxxy (o por correo)
// y, al teclearlo, el back devuelve la misma URL de entrada SSO que la opción A.
//
// Vive en un fichero PROPIO y lo abre FoxxyLoginButton.vue: Index.vue no cambia, así que un rebase
// sobre upstream no suma conflictos.
//
// Contrato con el back (specs/093-login-del-chat-con-codigo/contracts/openapi.yaml):
//   POST /v1/public/chat-sign-in/code         {email}        -> 202 {expires_in}
//   POST /v1/public/chat-sign-in/code/verify  {email, code}  -> 200 {url, expires_in}
//                                                              401 chat_code_invalid
//                                                              404 chat_user_unavailable
//                                                              429 rate_limited · 502 chat_unavailable
// Sin credenciales: el back publica estas rutas con CORS «*» y sin cookies.
//
// El texto no va en los JSON de locale de Chatwoot: son de upstream y se reescriben en cada versión.
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FormInput from '../../components/Form/Input.vue';
import NextButton from 'dashboard/components-next/button/Button.vue';
import { acceptSignInUrl } from './foxxySignInUrl';

const props = defineProps({
  // Base de la API de Foxxy. Fija en producción; la prop existe para las pruebas.
  apiBase: { type: String, default: 'https://foxxy-core.kiware.co/v1' },
  // Sustituye la navegación final; por defecto window.location.replace. Sólo para pruebas.
  navigate: { type: Function, default: null },
});

const emit = defineEmits(['cancel']);

const COPY = {
  es: {
    intro:
      'Escribe el correo de tu cuenta de Foxxy. Te enviaremos un código a la app de Foxxy o, si no te llega ahí, a tu correo.',
    email: 'Correo',
    emailPlaceholder: 'tu@correo.com',
    send: 'Enviarme el código',
    sentTo:
      'Si la cuenta puede entrar al chat, te llegó un código. Escríbelo aquí:',
    code: 'Código de 6 dígitos',
    submit: 'Entrar',
    resend: 'Pedir otro código',
    resent: 'Te enviamos otro código.',
    changeEmail: 'Cambiar correo',
    back: 'Volver',
    invalidEmail: 'Escribe un correo válido.',
    invalidCode: 'El código tiene 6 dígitos.',
    wrongCode: 'El código no es correcto o ya caducó. Revísalo o pide otro.',
    noHouse:
      'Tu cuenta no pertenece a ninguna casa con chat. Pídele a tu administrador que te asigne una.',
    tooMany: 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
    unavailable: 'El chat no responde ahora. Inténtalo de nuevo en un momento.',
  },
  en: {
    intro:
      'Type the email of your Foxxy account. We will send a code to the Foxxy app or, if it does not arrive there, to your email.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    send: 'Send me the code',
    sentTo:
      'If the account can use the chat, a code is on its way. Type it here:',
    code: '6-digit code',
    submit: 'Sign in',
    resend: 'Send another code',
    resent: 'We sent you another code.',
    changeEmail: 'Change email',
    back: 'Back',
    invalidEmail: 'Type a valid email.',
    invalidCode: 'The code has 6 digits.',
    wrongCode: 'The code is wrong or has expired. Check it or ask for another.',
    noHouse:
      'Your account belongs to no house with chat. Ask your administrator to assign you one.',
    tooMany: 'Too many attempts. Wait a few minutes and try again.',
    unavailable: 'The chat is not responding right now. Try again in a moment.',
  },
};

const { locale } = useI18n();
const copy = computed(() =>
  String(locale.value).toLowerCase().startsWith('es') ? COPY.es : COPY.en
);

const step = ref('email');
const email = ref('');
const code = ref('');
const loading = ref(false);
const error = ref('');
const notice = ref('');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function post(path, body) {
  return fetch(`${props.apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify(body),
  });
}

function messageFor(status) {
  if (status === 401) return copy.value.wrongCode;
  if (status === 404) return copy.value.noHouse;
  if (status === 429) return copy.value.tooMany;
  return copy.value.unavailable;
}

async function requestCode({ resend = false } = {}) {
  error.value = '';
  notice.value = '';
  const value = email.value.trim();
  if (!EMAIL_PATTERN.test(value)) {
    error.value = copy.value.invalidEmail;
    return;
  }
  loading.value = true;
  try {
    const response = await post('/public/chat-sign-in/code', { email: value });
    if (response.status !== 202) {
      error.value = messageFor(response.status);
      return;
    }
    step.value = 'code';
    code.value = '';
    if (resend) notice.value = copy.value.resent;
  } catch {
    error.value = copy.value.unavailable;
  } finally {
    loading.value = false;
  }
}

async function verifyCode() {
  error.value = '';
  notice.value = '';
  const value = code.value.replace(/\s/g, '');
  if (!/^[0-9]{6}$/.test(value)) {
    error.value = copy.value.invalidCode;
    return;
  }
  loading.value = true;
  try {
    const response = await post('/public/chat-sign-in/code/verify', {
      email: email.value.trim(),
      code: value,
    });
    if (response.status !== 200) {
      error.value = messageFor(response.status);
      return;
    }
    const body = await response.json();
    if (!acceptSignInUrl(body && body.url, window.location.origin)) {
      error.value = copy.value.unavailable;
      return;
    }
    // replace y no assign: la URL lleva un token de un solo uso y no debe quedar en el historial.
    (props.navigate || (url => window.location.replace(url)))(body.url);
  } catch {
    error.value = copy.value.unavailable;
  } finally {
    loading.value = false;
  }
}

function changeEmail() {
  step.value = 'email';
  code.value = '';
  error.value = '';
  notice.value = '';
}
</script>

<template>
  <div class="flex flex-col gap-4" data-testid="foxxy-code-sign-in">
    <form
      v-if="step === 'email'"
      class="space-y-5"
      novalidate
      @submit.prevent="requestCode()"
    >
      <p class="text-sm text-n-slate-11">{{ copy.intro }}</p>
      <FormInput
        v-model="email"
        name="foxxy_code_email"
        type="email"
        autocomplete="email"
        data-testid="foxxy-code-email"
        :label="copy.email"
        :placeholder="copy.emailPlaceholder"
      />
      <NextButton
        lg
        type="submit"
        class="w-full"
        data-testid="foxxy-code-send"
        :label="copy.send"
        :disabled="loading"
        :is-loading="loading"
      />
    </form>

    <form v-else class="space-y-5" novalidate @submit.prevent="verifyCode()">
      <p class="text-sm text-n-slate-11">{{ copy.sentTo }}</p>
      <FormInput
        v-model="code"
        name="foxxy_code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        data-testid="foxxy-code-input"
        :label="copy.code"
      />
      <NextButton
        lg
        type="submit"
        class="w-full"
        data-testid="foxxy-code-submit"
        :label="copy.submit"
        :disabled="loading"
        :is-loading="loading"
      />
      <div class="flex justify-between text-sm">
        <button
          type="button"
          class="text-link"
          data-testid="foxxy-code-resend"
          :disabled="loading"
          @click="requestCode({ resend: true })"
        >
          {{ copy.resend }}
        </button>
        <button
          type="button"
          class="text-link"
          data-testid="foxxy-code-change-email"
          @click="changeEmail"
        >
          {{ copy.changeEmail }}
        </button>
      </div>
    </form>

    <p
      v-if="error"
      role="alert"
      class="text-sm text-n-ruby-11"
      data-testid="foxxy-code-error"
    >
      {{ error }}
    </p>
    <p
      v-if="notice"
      class="text-sm text-n-slate-11"
      data-testid="foxxy-code-notice"
    >
      {{ notice }}
    </p>

    <button
      type="button"
      class="text-sm text-link self-center"
      data-testid="foxxy-code-back"
      @click="emit('cancel')"
    >
      {{ copy.back }}
    </button>
  </div>
</template>
