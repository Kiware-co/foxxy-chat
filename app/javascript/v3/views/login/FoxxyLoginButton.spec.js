// FOXXY: prueba del boton «Iniciar sesion con Foxxy» (spec 073 de olympus-ms-front).
// El destino es un contrato con el panel de Foxxy: si esta prueba cambia, cambia tambien la ruta
// /chat/sign-in de apps/admin, y el panel se despliega ANTES que este fork.
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import FoxxyLoginButton from './FoxxyLoginButton.vue';

function mountWithLocale(locale) {
  const i18n = createI18n({
    legacy: false,
    locale,
    messages: { [locale]: { COMMON: { OR: locale === 'es' ? 'O' : 'Or' } } },
    missingWarn: false,
    fallbackWarn: false,
  });
  return mount(FoxxyLoginButton, { global: { plugins: [i18n] } });
}

describe('FoxxyLoginButton.vue', () => {
  it('enlaza exactamente a la ruta de rebote del panel, en la misma ventana', () => {
    const link = mountWithLocale('es').find('a');
    expect(link.attributes('href')).toBe('https://app.foxxy.pro/chat/sign-in');
    expect(link.attributes('target')).toBeUndefined();
    expect(link.attributes('rel')).toBeUndefined();
  });

  it('el enlace no lleva parametros: el destino no se decide aqui', () => {
    const href = new URL(mountWithLocale('es').find('a').attributes('href'));
    expect(href.search).toBe('');
    expect(href.hash).toBe('');
  });

  it('dice «Iniciar sesión con Foxxy» en espanol', () => {
    expect(mountWithLocale('es').find('a').text()).toBe(
      'Iniciar sesión con Foxxy'
    );
    expect(mountWithLocale('es_CO').find('a').text()).toBe(
      'Iniciar sesión con Foxxy'
    );
  });

  it('dice «Sign in with Foxxy» en cualquier otro idioma', () => {
    expect(mountWithLocale('en').find('a').text()).toBe('Sign in with Foxxy');
    expect(mountWithLocale('pt_BR').find('a').text()).toBe(
      'Sign in with Foxxy'
    );
  });

  it('separa el boton del formulario con el divisor «O» de Chatwoot', () => {
    expect(mountWithLocale('es').text()).toContain('O');
  });
});
