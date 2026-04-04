export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        let response = await env.ASSETS.fetch(request);

        // Handle 404s: if it's a single-segment path (like /vendor-slug),
        // serve the dynamic [slug] page fallback
        if (response.status === 404) {
            const pathSegments = url.pathname.split('/').filter(Boolean);

            // Single segment = likely a vendor slug (e.g., /some-vendor)
            if (pathSegments.length === 1) {
                // Try to serve the pre-generated [slug] fallback
                const fallbackRequest = new Request(
                    new URL('/demo/', request.url),
                    request
                );
                response = await env.ASSETS.fetch(fallbackRequest);
            }
        }

        const contentType = response.headers.get("content-type") || "";

        // If it's HTML → disable caching
        if (contentType.includes("text/html")) {
            return new Response(response.body, {
                status: response.status,
                headers: {
                    ...Object.fromEntries(response.headers),
                    "Cache-Control": "no-store",
                },
            });
        }

        // Otherwise return as-is (assets can stay cached)
        return response;
    },
} satisfies ExportedHandler<{ ASSETS: Fetcher }>;