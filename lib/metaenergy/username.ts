export function normalizeUsernameId(value: string | null | undefined) {
  return (value ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20);
}

export function isValidUsernameId(value: string | null | undefined) {
  return /^[a-z0-9]{4,20}$/.test(value ?? "");
}
