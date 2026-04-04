export const GET_SUBSCRIPTION_QUERY = `#graphql
    query GetAppSubscription($id: ID!) {
        node(id: $id) {
            ... on AppSubscription {
                id
                name
                status
                currentPeriodEnd
            }
        }
    }
`;

export const GET_ALL_SUBSCRIPTIONS_QUERY = `#graphql
    query {
        currentAppInstallation {
            allSubscriptions(first: 1, reverse: true) {
                edges {
                    node {
                        id
                        name
                        status
                        currentPeriodEnd
                    }
                }
            }
        }
    }
`;
export const GET_CHARGE_HISTORY_QUERY = `#graphql
  query {
    currentAppInstallation {
      allSubscriptions(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            status
            createdAt
            currentPeriodEnd
            test
            lineItems {
              id
              plan {
                pricingDetails {
                  __typename
                  ... on AppRecurringPricing {
                    price {
                      amount
                      currencyCode
                    }
                    interval
                  }
                  ... on AppUsagePricing {
                    terms
                    balanceUsed {
                      amount
                      currencyCode
                    }
                    cappedAmount {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
      oneTimePurchases(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            status
            createdAt
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const CANCEL_SUBSCRIPTION_MUTATION = `#graphql
  mutation AppSubscriptionCancel($id: ID!) {
    appSubscriptionCancel(id: $id) {
      appSubscription {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;
