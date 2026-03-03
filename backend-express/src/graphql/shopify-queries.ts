export const GET_PRODUCTS_BY_IDS_QUERY = `#graphql
  query ($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        featuredMedia {
          preview {
            image {
              url
              altText
            }
          }
        }
        status
        totalInventory
      }
    }
  }
`;

export const GET_SHOP_CURRENCY_QUERY = `#graphql
  query {
    shop {
      currencyCode
    }
  }
`;
