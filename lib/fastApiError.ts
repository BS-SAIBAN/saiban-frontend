/** Turn FastAPI `detail` (string | validation array | object) into a single readable message. */
export function formatFastApiDetail(detail: unknown): string {
  if (detail == null) return 'Request could not be processed';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item: unknown) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          const o = item as { msg?: unknown; loc?: unknown };
          const loc = Array.isArray(o.loc) ? o.loc.filter(Boolean).join('.') : '';
          const msg = String(o.msg ?? '');
          return loc ? `${loc}: ${msg}` : msg;
        }
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join('; ');
  }
  if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
    return String((detail as { msg: unknown }).msg);
  }
  try {
    return JSON.stringify(detail);
  } catch {
    return 'Request could not be processed';
  }
}
