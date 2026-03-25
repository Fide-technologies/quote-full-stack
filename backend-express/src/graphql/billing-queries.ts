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
                        name
                        status
                        currentPeriodEnd
                    }
                }
            }
        }
    }
`;
