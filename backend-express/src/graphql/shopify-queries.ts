export const GET_PRODUCTS_BY_IDS_QUERY = `#graphql
  query ($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        vendor
        productType
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
        variants(first: 100) {
          nodes {
            id
            title
            sku
            price
            inventoryQuantity
          }
        }
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
