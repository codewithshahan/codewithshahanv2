import config from "@/lib/config";

/**
 * Direct testing of Hashnode API
 * Run this file with:
 * npx ts-node lib/test-hashnode-api.ts
 */

const HASHNODE_API_URL = "https://gql.hashnode.com";

// Test query using publication ID (current approach)
const QUERY_BY_ID = `
  query GetPosts($publicationId: ObjectId!) {
    publication(id: $publicationId) {
      title
      posts(first: 3) {
        edges {
          node {
            _id
            title
            slug
          }
        }
      }
    }
  }
`;

// Test query using publication host (alternative approach)
const QUERY_BY_HOST = `
  query GetPosts($host: String!) {
    publication(host: $host) {
      title
      posts(first: 3) {
        edges {
          node {
            _id
            title
            slug
          }
        }
      }
    }
  }
`;

// Logs current configuration for verification
function logConfiguration() {
  console.log("📝 Current Hashnode Configuration:");
  console.log(`- Username: ${config.hashnode.username}`);
  console.log(`- Publication ID: ${config.hashnode.publicationId}`);
  console.log(`- API Key: ${config.hashnode.apiKey ? "Provided" : "Missing"}`);

  // Generate possible host values to try
  const possibleHosts = [
    `${config.hashnode.username}.hashnode.dev`,
    `${config.hashnode.username}.dev`,
    config.hashnode.username,
  ];
  console.log("- Possible host values to try:", possibleHosts);
}

// Test function for ID-based query
async function testQueryById() {
  if (!config.hashnode.publicationId) {
    console.error("❌ No publication ID provided in config");
    return;
  }

  console.log("\n🧪 Testing publication ID query...");

  try {
    const response = await fetch(HASHNODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: config.hashnode.apiKey
          ? `Bearer ${config.hashnode.apiKey}`
          : "",
      },
      body: JSON.stringify({
        query: QUERY_BY_ID,
        variables: {
          publicationId: config.hashnode.publicationId,
        },
      }),
    });

    const json = await response.json();

    console.log("📥 Response status:", response.status);

    if (json.errors) {
      console.error("❌ GraphQL errors:", JSON.stringify(json.errors, null, 2));
    }

    if (json.data?.publication) {
      console.log("✅ Publication found:", json.data.publication.title);
      if (json.data.publication.posts?.edges?.length > 0) {
        console.log(
          `✅ Found ${json.data.publication.posts.edges.length} posts`
        );
        console.log(
          "First post:",
          json.data.publication.posts.edges[0].node.title
        );
      } else {
        console.warn("⚠️ No posts found in this publication");
      }
    } else {
      console.error("❌ No publication data returned");
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
  }
}

// Test function for host-based query
async function testQueryByHost() {
  if (!config.hashnode.username) {
    console.error("❌ No username provided in config");
    return;
  }

  console.log("\n🧪 Testing publication host query...");

  // Try different host formats
  const hosts = [
    `${config.hashnode.username}.hashnode.dev`,
    config.hashnode.username,
  ];

  for (const host of hosts) {
    console.log(`\n🔍 Trying host: ${host}`);

    try {
      const response = await fetch(HASHNODE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: config.hashnode.apiKey
            ? `Bearer ${config.hashnode.apiKey}`
            : "",
        },
        body: JSON.stringify({
          query: QUERY_BY_HOST,
          variables: { host },
        }),
      });

      const json = await response.json();

      console.log("📥 Response status:", response.status);

      if (json.errors) {
        console.error(
          "❌ GraphQL errors:",
          JSON.stringify(json.errors, null, 2)
        );
      }

      if (json.data?.publication) {
        console.log("✅ Publication found:", json.data.publication.title);
        if (json.data.publication.posts?.edges?.length > 0) {
          console.log(
            `✅ Found ${json.data.publication.posts.edges.length} posts`
          );
          console.log(
            "First post:",
            json.data.publication.posts.edges[0].node.title
          );
        } else {
          console.warn("⚠️ No posts found in this publication");
        }
      } else {
        console.error("❌ No publication data returned for this host");
      }
    } catch (error) {
      console.error(`❌ Request failed for host ${host}:`, error);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log("🔍 HASHNODE API TEST 🔍");
  logConfiguration();
  await testQueryById();
  await testQueryByHost();
  console.log("\n✨ Test complete!");
}

// Uncomment to run in Node.js directly
// runAllTests();

// Export for use in Next.js
export { runAllTests, testQueryById, testQueryByHost };
