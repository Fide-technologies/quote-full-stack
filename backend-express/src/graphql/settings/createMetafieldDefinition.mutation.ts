export const CREATE_METAFIELD_DEFINITION_MUTATION = `#graphql
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id name }
      userErrors { field message code }
    }
  }
`;
