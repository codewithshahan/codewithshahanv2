/**
 * Utility for making GraphQL requests to Hashnode API
 */

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
    const response = await fetch(HASHNODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if available
        ...(process.env.NEXT_PUBLIC_HASHNODE_API_KEY
          ? { Authorization: process.env.NEXT_PUBLIC_HASHNODE_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // Include cache control for Vercel Edge Cache compatibility
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Hashnode API responded with status ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      const errorMessage = json.errors.map((e: any) => e.message).join(", ");
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }

    return json.data;
  } catch (error) {
    console.error("[API] Hashnode GraphQL query failed:", error);
    throw error;
  }
}
