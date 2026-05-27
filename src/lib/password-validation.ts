const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

export const PASSWORD_REQUIREMENTS_ERROR =
  "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

export type PasswordDisplayRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

/** Rules shown in the live checklist (8 characters and lowercase are validated but not listed). */
export const PASSWORD_DISPLAY_RULES: PasswordDisplayRule[] = [
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (value) => HAS_UPPERCASE.test(value)
  },
  {
    id: "number",
    label: "At least one number",
    test: (value) => HAS_NUMBER.test(value)
  },
  {
    id: "special",
    label: "At least one special character (e.g. ! @ # $ % ^ & *)",
    test: (value) => HAS_SPECIAL.test(value)
  }
];

export function getPasswordDisplayRuleStates(password: string) {
  return PASSWORD_DISPLAY_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password)
  }));
}

export function meetsStrongPasswordRules(value: string): boolean {
  return (
    value.length >= 8 &&
    HAS_LOWERCASE.test(value) &&
    HAS_UPPERCASE.test(value) &&
    HAS_NUMBER.test(value) &&
    HAS_SPECIAL.test(value)
  );
}

/** Returns a field error code: required, weak (show requirements list), or valid. */
export function validateStrongPassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (!meetsStrongPasswordRules(value)) return "weak";
  return undefined;
}
