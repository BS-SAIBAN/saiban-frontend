import { extractCnicDigits } from './cnicFormat';

/** Normalize Next route param (sometimes typed as string but runtime edge cases). */
export function normalizeRouteId(param: unknown): string {
  if (Array.isArray(param)) return String(param[0] ?? '').trim();
  if (param == null) return '';
  return String(param).trim();
}

export function isValidFamilyIdParam(param: unknown): boolean {
  const id = normalizeRouteId(param);
  return id.length > 0 && id !== 'undefined' && id !== 'null';
}

function safeNonNegInt(v: unknown, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) return fallback;
    return Math.trunc(v);
  }
  const s = String(v).trim();
  if (s === '') return fallback;
  const n = parseInt(s, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function str(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === '' ? null : t;
}

/** Body for POST /individuals — only valid fields, safe numbers, digits-only CNIC. */
export function buildIndividualCreateBody(form: Record<string, unknown>, familyIdRaw: unknown): Record<string, unknown> {
  const family_id = normalizeRouteId(familyIdRaw);
  return {
    family_id,
    full_name: str(form.full_name).trim(),
    gender: form.gender,
    dob: form.dob,
    cnic_or_bform: extractCnicDigits(str(form.cnic_or_bform)),
    relationship_to_head: form.relationship_to_head,
    is_orphan: Boolean(form.is_orphan),
    is_child: Boolean(form.is_child),
    is_disabled: Boolean(form.is_disabled),
    is_patient: Boolean(form.is_patient),
    occupation: emptyToNull(str(form.occupation)),
    monthly_income: safeNonNegInt(form.monthly_income),
    debt_amount: safeNonNegInt(form.debt_amount),
    school_name: emptyToNull(str(form.school_name)),
    current_class: emptyToNull(str(form.current_class)),
    monthly_school_fee: safeNonNegInt(form.monthly_school_fee),
    religion: emptyToNull(str(form.religion)),
    caste: emptyToNull(str(form.caste)),
    photo_url: emptyToNull(str(form.photo_url)),
  };
}

/** Body for PUT /individuals/:id. Pass `original` (server snapshot) to skip fields that did not change — avoids head/CNIC/orphan guard false positives. */
export function buildIndividualUpdateBody(
  form: Record<string, unknown>,
  original?: Record<string, unknown> | null,
): Record<string, unknown> {
  const full: Record<string, unknown> = {
    full_name: str(form.full_name).trim(),
    gender: form.gender,
    dob: form.dob,
    cnic_or_bform: extractCnicDigits(str(form.cnic_or_bform)),
    relationship_to_head: form.relationship_to_head,
    is_orphan: Boolean(form.is_orphan),
    is_child: Boolean(form.is_child),
    is_disabled: Boolean(form.is_disabled),
    is_patient: Boolean(form.is_patient),
    occupation: emptyToNull(str(form.occupation)),
    monthly_income: safeNonNegInt(form.monthly_income),
    debt_amount: safeNonNegInt(form.debt_amount),
    school_name: emptyToNull(str(form.school_name)),
    current_class: emptyToNull(str(form.current_class)),
    monthly_school_fee: safeNonNegInt(form.monthly_school_fee),
    religion: emptyToNull(str(form.religion)),
    caste: emptyToNull(str(form.caste)),
    photo_url: emptyToNull(str(form.photo_url)),
  };

  if (!original) {
    return full;
  }

  const out: Record<string, unknown> = { ...full };

  if (String(form.relationship_to_head ?? '') === String(original.relationship_to_head ?? '')) {
    delete out.relationship_to_head;
  }

  if (extractCnicDigits(str(form.cnic_or_bform)) === extractCnicDigits(str(original.cnic_or_bform ?? ''))) {
    delete out.cnic_or_bform;
  }

  for (const key of ['is_orphan', 'is_child', 'is_disabled', 'is_patient'] as const) {
    if (Boolean(form[key]) === Boolean(original[key])) {
      delete out[key];
    }
  }

  return out;
}
