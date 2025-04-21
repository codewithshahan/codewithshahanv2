// Direct test script for fetching author data
const axios = require("axios");

// Fetch author data from the API
async function fetchAuthorData() {
  try {
    const username = "codewithshahan";
    console.log("Fetching author data for:", username);

    // Use the same query as in the application
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

    const response = await axios.post(
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
    );

    console.log("Response status:", response.status);

    if (response.data.errors) {
      console.error("GraphQL errors:", response.data.errors);
      return null;
    }

    const userData = response.data.data?.user;

    if (!userData) {
      console.error("Author not found");
      return null;
    }

    console.log("Author found:", userData.name);
    console.log("Bio:", userData.bio?.text);
    console.log("Publications:", userData.publications?.edges?.length);

    // Extract and return the processed author data
    const publication = userData.publications?.edges?.[0]?.node;
    const posts = publication?.posts?.edges?.map((edge) => edge.node) || [];

    console.log("Posts found:", posts.length);

    return userData;
  } catch (error) {
    console.error("Error fetching author data:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return null;
  }
}

// Run the test
fetchAuthorData().then((author) => {
  if (author) {
    console.log("Author data fetched successfully");
  } else {
    console.log("Failed to fetch author data");
  }
});
