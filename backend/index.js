import {SelfBackendVerifier, AllIds,DefaultConfigStore} from "@selfxyz/core"

const selfBackendVerifier = new SelfBackendVerifier(
    "self-playground",
    "https://playground.self.xyz/api/verify",
    false, // mainnet
    AllIds,
    new DefaultConfigStore({
        minimumAge:18,
        excludedCountries: ["IRN", "PRK", "RUS", "SYR"],
        ofac: true,
    }),
    "hex"
);

async function handleVerify(req) {
    try {
        // Extract data from the request
        const { attestationId, proof, publicSignals, userContextData } = await req.json();

        // Verify all required fields are present
        if (!proof || !publicSignals || !attestationId || !userContextData) {
            return new Response(JSON.stringify({
                message: "Proof, publicSignals, attestationId and userContextData are required",
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Verify the proof
        const result = await selfBackendVerifier.verify(
            attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
            proof,            // The zero-knowledge proof
            publicSignals,    // Public signals array
            userContextData   // User context data (hex string)
        );

        // Check if verification was successful
        if (result.isValidDetails.isValid) {
            // Verification successful - process the result
            return new Response(JSON.stringify({
                status: "success",
                result: true,
                credentialSubject: result.discloseOutput,
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            // Verification failed
            return new Response(JSON.stringify({
                status: "error",
                result: false,
                reason: "Verification failed",
                error_code: "VERIFICATION_FAILED",
                details: result.isValidDetails,
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            status: "error",
            result: false,
            reason: error instanceof Error ? error.message : "Unknown error",
            error_code: "UNKNOWN_ERROR"
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}

// Start the server
Bun.serve({
    port: 3001,
    async fetch(req) {
        const url = new URL(req.url);
        if (req.method === 'POST' && url.pathname === '/api/verify') {
            return await handleVerify(req);
        }
        return new Response('Not Found', { status: 404 });
    },
});