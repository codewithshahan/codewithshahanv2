// A simple script to test Hashnode API integration
const axios = require("axios");

// Define the GraphQL query - simplified version to verify API connectivity
const query = `
  query GetUserByUsername($username: String!) {
    user(username: $username) {
      id
      name
      username
    }
  }
`;

// Username to test with
const username = "codewithshahan";

console.log("Making request to Hashnode API for username:", username);
console.log("Query:", query);

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
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    if (response.data.errors) {
      console.error("GraphQL errors:", response.data.errors);
    }

    if (!response.data.data?.user) {
      console.warn(
        "User not found or data structure is different than expected"
      );
    }
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
