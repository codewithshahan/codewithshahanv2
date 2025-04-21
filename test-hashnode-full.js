// A comprehensive test script for the Hashnode API
const axios = require("axios");

// Full query from our authorService with fixes for bio and publication
const query = `
  query GetUserByUsername($username: String!) {
    user(username: $username) {
      id
      name
      username
      profilePicture
      tagline
      bio {
        text
      }
      location
      socialMediaLinks {
        website
        github
        twitter
        linkedin
        facebook
      }
      publications(first: 1) {
        edges {
          node {
            id
            posts(first: 10) {
              edges {
                node {
                  id
                  title
                  slug
                  brief
                  coverImage {
                    url
                  }
                  readTimeInMinutes
                  publishedAt
                  tags {
                    id
                    name
                    slug
                  }
                  reactionCount
                  responseCount
                }
              }
              totalDocuments
            }
          }
        }
      }
    }
  }
`;

// Username to test with
const username = "codewithshahan";

console.log("Testing full Hashnode API query for username:", username);

// Make the request
axios
  .post(
    "https://gql.hashnode.com",
    {
      query,
      variables: { username },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  .then((response) => {
    console.log("Success! Response status:", response.status);

    if (response.data.errors) {
      console.error(
        "GraphQL errors:",
        JSON.stringify(response.data.errors, null, 2)
      );
      process.exit(1);
    }

    const user = response.data.data?.user;
    if (!user) {
      console.warn(
        "User not found or data structure is different than expected"
      );
      process.exit(1);
    }

    // Print a summary of the response structure
    console.log("\n=== User Information ===");
    console.log(`Name: ${user.name}`);
    console.log(`Username: ${user.username}`);
    console.log(
      `Bio: ${
        user.bio?.text ? user.bio.text.substring(0, 50) + "..." : "Not provided"
      }`
    );

    // Publication information
    const publication = user.publications?.edges?.[0]?.node;
    if (publication) {
      console.log("\n=== Publication Information ===");
      console.log(`Publication ID: ${publication.id}`);

      const posts = publication.posts?.edges?.map((edge) => edge.node) || [];
      console.log(`Total posts: ${publication.posts?.totalDocuments || 0}`);
      console.log(`Posts in response: ${posts.length}`);

      if (posts.length > 0) {
        console.log("\n=== First Article Preview ===");
        const firstPost = posts[0];
        console.log(`Title: ${firstPost.title}`);
        console.log(`Slug: ${firstPost.slug}`);
        console.log(`Reading time: ${firstPost.readTimeInMinutes} minutes`);
        console.log(
          `Tags: ${firstPost.tags?.map((tag) => tag.name).join(", ") || "None"}`
        );
      }
    } else {
      console.log("\nNo publication found for this user");
    }

    console.log("\nFull API response saved to response.json");
    require("fs").writeFileSync(
      "response.json",
      JSON.stringify(response.data, null, 2),
      "utf8"
    );
  })
  .catch((error) => {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    console.error("Request details:", {
      url: "https://gql.hashnode.com",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: { query, variables: { username } },
    });
  });
