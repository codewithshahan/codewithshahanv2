/**
 * Utility for making GraphQL requests to Hashnode API
 */

import config from "@/lib/config";

const HASHNODE_API_URL = "https://gql.hashnode.com";

/**
 * Execute a GraphQL query against the Hashnode API
 *
 * @param query GraphQL query string
 * @param variables Optional variables for the query
 * @returns Promise with the query results
 */
export async function fetchHashnodeQuery(
  query: string,
  variables: Record<string, any> = {}
): Promise<any> {
  try {
    console.log("🔍 HASHNODE API DEBUGGING 🔍");

    // Validate required configuration
    if (!config.hashnode.apiKey) {
      console.error("❌ Hashnode API key is missing. API calls will fail.");
    } else {
      console.log(
        "✅ API Key found:",
        config.hashnode.apiKey.substring(0, 5) +
          "..." +
          config.hashnode.apiKey.substring(config.hashnode.apiKey.length - 5)
      );
    }

    // Validate that required variables are present
    console.log("📊 Request Variables:", JSON.stringify(variables, null, 2));

    if (!variables.publicationId) {
      console.error(
        "❌ Missing publicationId in variables. This will cause API errors."
      );
    } else {
      console.log("✅ Publication ID:", variables.publicationId);
    }

    if (!variables.username) {
      console.error("❌ Missing username in variables. This may cause issues.");
    } else {
      console.log("✅ Username:", variables.username);
    }

    console.log(
      "📝 Query:",
      query.replace(/\s+/g, " ").trim().substring(0, 100) + "..."
    );

    // Create headers object with proper typing
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if API key is available
    if (config.hashnode.apiKey) {
      headers["Authorization"] = `Bearer ${config.hashnode.apiKey}`;
      console.log("✅ Added Authorization header");
    }

    console.log("🌐 Making request to:", HASHNODE_API_URL);
    console.log("📤 Request headers:", JSON.stringify(headers, null, 2));

    const response = await fetch(HASHNODE_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      // Include cache control for Vercel Edge Cache compatibility
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Could not read error response");
      console.error(`❌ Hashnode API error (${response.status}):`, errorText);
      throw new Error(
        `Hashnode API responded with status ${response.status}: ${errorText}`
      );
    }

    const json = await response.json();
    console.log(
      "📦 Raw response:",
      JSON.stringify(json).substring(0, 200) + "..."
    );

    if (json.errors) {
      const errorMessage = json.errors.map((e: any) => e.message).join(", ");
      console.error("❌ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }

    // Check if response data is as expected
    if (!json.data) {
      console.error("❌ No data returned from API");
    } else if (!json.data.publication) {
      console.error("❌ No publication data returned. Check publication ID.");
    } else if (!json.data.publication.posts) {
      console.error("❌ No posts data returned. Check query structure.");
    } else if (
      !json.data.publication.posts.edges ||
      json.data.publication.posts.edges.length === 0
    ) {
      console.warn("⚠️ No posts found for this publication.");
    } else {
      console.log(
        `✅ Successfully fetched ${json.data.publication.posts.edges.length} posts`
      );
    }

    return json.data;
  } catch (error) {
    console.error("❌ Hashnode GraphQL query failed:", error);
    // Enhanced error for debugging
    if (error instanceof Error) {
      error.message = `Hashnode API Error: ${error.message}`;
    }
    throw error;
  }
}
