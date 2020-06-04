const CODE_0 = '0'.charCodeAt(0);
const CODE_A = 'A'.charCodeAt(0) - 10;
const CODE_a = 'a'.charCodeAt(0) - 10;
export function hexStringToUint8Array(str: string): Uint8Array {
  if (str.length & 1) throw new Error('expected even length');
  const arr = new Uint8Array(str.length >> 1);
  for (let i = 0, j = 0; i < str.length; i += 2, ++j) {
    const msd = str.charCodeAt(i);
    let msv = msd - CODE_0;
    if (msv >= 10) {
      msv = msd - CODE_A;
      if (msv >= 16) {
        msv = msd - CODE_a;
      } else if (msv < 10) {
        msv = -1;
      }
    }
    if (msv < 0 || msv >= 16) {
      throw new Error(`bad char at pos str.charAt(${i}) = '${str.charAt(i)}'`);
    }
    const lsd = str.charCodeAt(i + 1);
    let lsv = lsd - CODE_0;
    if (lsv >= 10) {
      lsv = lsd - CODE_A;
      if (lsv >= 16) {
        lsv = lsd - CODE_a;
      } else if (lsv < 10) {
        lsv = -1;
      }
    }
    if (lsv < 0 || lsv >= 16) {
      throw new Error(`bad char at pos str.charAt(${i + 1}) = '${str.charAt(i + 1)}'`);
    }
    arr[j] = (msv << 4) | lsv;
  }
  return arr;
}
export function hexStringToArrayBuffer(str: string): ArrayBuffer {
  return hexStringToUint8Array(str).buffer;
}
const digits = '0123456789abcdef';
export function uint8ArrayToHexString(arr: Uint8Array): string {
  let str = '';
  for (let i = 0; i < arr.length; ++i) {
    str += digits.charAt(arr[i] >> 4) + digits.charAt(arr[i] & 0xF);
  }
  return str;
}
export function arrayBufferToHexString(buf: ArrayBuffer): string {
  return uint8ArrayToHexString(new Uint8Array(buf));
}
