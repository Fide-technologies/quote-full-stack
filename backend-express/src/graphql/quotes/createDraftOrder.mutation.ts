export const CREATE_DRAFT_ORDER_MUTATION_FULL = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        shippingAddress {
          address1
          address2
          city
          company
          province
          provinceCode
          zip
          country
          countryCodeV2
          firstName
          lastName
          phone
        }
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
            shippingAddress {
              address1
              address2
              city
              company
              province
              provinceCode
              zip
              country
              countryCodeV2
              firstName
              lastName
              phone
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
