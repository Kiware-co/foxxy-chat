// FOXXY: los botones «Pasar a la modelo virtual» / «Sacar a la modelo virtual» (spec 211 de
// olympus-ms-back). El back decide todo: el buzón real del chat (nunca el de la URL), si la virtual
// está encendida y quién puede pulsar. Aquí sólo se llama y se pinta lo que responde.
//
// La credencial es el access_token de Chatwoot de quien mira, en la cabecera X-Chatwoot-Token: el back
// lo comprueba contra /api/v1/profile y lo cruza con su usuario de Foxxy. fetch sin credenciales (sin
// cookies): la ruta es /v1/public/… con CORS propio.

export const FOXXY_API_BASE = 'https://foxxy-core.kiware.co/v1';

export function botPath(accountId, conversationId, action = '') {
  const base = `/public/chat/conversations/${encodeURIComponent(accountId)}/${encodeURIComponent(conversationId)}/bot`;
  return action ? `${base}/${action}` : base;
}

// callVirtualModel llama a la ruta y devuelve { ok, status, state, message }. Nunca lanza.
export async function callVirtualModel({
  apiBase = FOXXY_API_BASE,
  token,
  accountId,
  conversationId,
  action = '',
  fetchImpl = fetch,
}) {
  if (!token || !accountId || !conversationId) {
    return { ok: false, status: 0, state: null, message: '' };
  }
  try {
    const response = await fetchImpl(
      `${apiBase}${botPath(accountId, conversationId, action)}`,
      {
        method: action ? 'POST' : 'GET',
        credentials: 'omit',
        headers: { 'X-Chatwoot-Token': token, Accept: 'application/json' },
      }
    );
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        state: null,
        message: body?.message || body?.error?.message || '',
      };
    }
    return { ok: true, status: response.status, state: body, message: '' };
  } catch {
    return { ok: false, status: 0, state: null, message: '' };
  }
}
