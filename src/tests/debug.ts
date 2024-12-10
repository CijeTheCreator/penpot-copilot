export const DEBUG = true;

export function LOGGERB(value: unknown) {
  if (DEBUG) console.log("Below ", value);
}
export function LOGGERA(value: unknown) {
  if (DEBUG) console.log("Above ", value);
}
