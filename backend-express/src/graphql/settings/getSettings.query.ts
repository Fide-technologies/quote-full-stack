export const GET_SETTINGS_QUERY = `#graphql
  query getSettings {
    shop {
      id
      config: metafield(namespace: "merchant_quote", key: "config") { 
        id
        value 
      }
    }
  }
`;
