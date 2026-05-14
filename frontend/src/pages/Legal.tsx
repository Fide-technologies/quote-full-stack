import { Layout, Page } from '@shopify/polaris';
import type React from 'react';
import { LegalContent } from '../components/settings/LegalContent';

export const Legal: React.FC = () => {
  return (
    <Page
      title="Legal & Privacy"
      subtitle="Policies and terms regarding your data and usage of the app."
      backAction={{ content: 'Settings', url: '/settings' }}
    >
      <Layout>
        <Layout.Section>
          <LegalContent />
        </Layout.Section>
      </Layout>
    </Page>
  );
};
