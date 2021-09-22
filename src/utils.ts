export function capitalize(str: string) {
  return str.length ? str.replace(str[0], str[0].toUpperCase()) : '';
}
