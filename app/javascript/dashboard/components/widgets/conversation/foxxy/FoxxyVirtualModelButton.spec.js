// FOXXY: prueba del botón de la modelo virtual (spec 211 de olympus-ms-back). Las rutas son un
// contrato con el back: si cambian aquí, cambian en internal/adapters/http/bot_takeover_handler.go.
import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import FoxxyVirtualModelButton from './FoxxyVirtualModelButton.vue';
import { botPath, callVirtualModel } from './foxxyVirtualModel';

vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));

function jsonResponse(status, body) {
  return { ok: status < 300, status, json: async () => body };
}

function mountButton(responses) {
  const calls = [];
  global.fetch = vi.fn(async (url, init) => {
    calls.push({ url, init });
    return responses.shift();
  });
  const store = createStore({
    getters: { getCurrentUser: () => ({ access_token: 'tok-cw' }) },
  });
  const wrapper = mount(FoxxyVirtualModelButton, {
    props: {
      chat: { id: 47590, status: 'open' },
      accountId: 4,
      apiBase: 'https://api.test/v1',
    },
    global: {
      plugins: [store],
      stubs: {
        NextButton: {
          props: ['label'],
          emits: ['click'],
          template: '<button @click="$emit(\'click\')">{{ label }}</button>',
        },
      },
    },
  });
  return { wrapper, calls };
}

describe('foxxyVirtualModel', () => {
  it('compone las rutas del back', () => {
    expect(botPath(4, 47590)).toBe('/public/chat/conversations/4/47590/bot');
    expect(botPath(4, 47590, 'take')).toBe(
      '/public/chat/conversations/4/47590/bot/take'
    );
  });

  it('sin token no llama', async () => {
    const fetchImpl = vi.fn();
    const r = await callVirtualModel({
      token: '',
      accountId: 4,
      conversationId: 1,
      fetchImpl,
    });
    expect(r.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('un fallo de red no lanza', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('red');
    });
    const r = await callVirtualModel({
      token: 't',
      accountId: 4,
      conversationId: 1,
      fetchImpl,
    });
    expect(r).toEqual({ ok: false, status: 0, state: null, message: '' });
  });
});

describe('FoxxyVirtualModelButton.vue', () => {
  it('pide el estado con el token de Chatwoot y sin cookies', async () => {
    const { wrapper, calls } = mountButton([
      jsonResponse(200, {
        available: true,
        active: false,
        model_name: 'Katty',
      }),
    ]);
    await flushPromises();
    expect(calls[0].url).toBe(
      'https://api.test/v1/public/chat/conversations/4/47590/bot'
    );
    expect(calls[0].init.method).toBe('GET');
    expect(calls[0].init.credentials).toBe('omit');
    expect(calls[0].init.headers['X-Chatwoot-Token']).toBe('tok-cw');
    expect(wrapper.text()).toContain('Pasar a la modelo virtual');
  });

  it('no se pinta si el buzón no tiene virtual o la persona no puede', async () => {
    const { wrapper } = mountButton([jsonResponse(403, { code: 'forbidden' })]);
    await flushPromises();
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('pasar y luego sacar', async () => {
    const { wrapper, calls } = mountButton([
      jsonResponse(200, { available: true, active: false }),
      jsonResponse(200, { available: true, active: true, queued: true }),
      jsonResponse(200, { available: true, active: false }),
    ]);
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();
    expect(calls[1].url).toMatch(/\/bot\/take$/);
    expect(calls[1].init.method).toBe('POST');
    expect(wrapper.text()).toContain('Virtual activa');

    await wrapper.find('button').trigger('click');
    await flushPromises();
    expect(calls[2].url).toMatch(/\/bot\/release$/);
    expect(wrapper.text()).toContain('Pasar a la modelo virtual');
  });
});
