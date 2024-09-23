const config = {
    candyMachineId: import.meta.env.VITE_CANDY_MACHINE_ID,
    secretKeyArray: JSON.parse(import.meta.env.VITE_SECRET_KEY_ARRAY),
    pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
    pinataSecretApiKey: import.meta.env.VITE_PINATA_SECRET_API_KEY,
    pinataJWT: import.meta.env.VITE_PINATA_JWT
};

export default config;