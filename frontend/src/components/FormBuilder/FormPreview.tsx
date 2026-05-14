import type React from 'react';
import type { IForm } from '../../api/forms';
import { QuoteForm } from './QuoteForm';
import './PreviewStyles.css';

interface FormPreviewProps {
  formState: IForm;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ formState }) => {
  return (
    <div className="bg-[#fafbfc] p-8 md:p-12 min-h-[700px] flex items-start justify-center w-full">
      <div className="bg-white w-full max-w-[800px] min-h-[500px] shadow-sm border border-gray-200 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="p-0">
          {formState && <QuoteForm formState={formState} isPreview={true} />}
        </div>
      </div>
    </div>
  );
};
