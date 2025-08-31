// Encryption features removed
export const EncryptionManager = (_: { roomId: string; onEncryptionToggle: (v: boolean)=>void }) => null;
export const encryptMessage = (m: string) => m;
export const decryptMessage = (m: string) => m;
