export const GET_SETTINGS_QUERY = `#graphql
  query getSettings {
    shop {
      id
      showOnAll: metafield(namespace: "request_q", key: "show_on_all") { 
        id
        value 
      }
    }
  }
`;
