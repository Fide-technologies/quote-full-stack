export const CREATE_DRAFT_ORDER_MUTATION_FULL = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
        totalPrice
        customer {
          id
          email
          firstName
          lastName
        }
        lineItems(first: 10) {
          edges {
            node {
              id
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CREATE_DRAFT_ORDER_MUTATION_MINIMAL = `
      mutation CreateDraftOrder($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            invoiceUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
