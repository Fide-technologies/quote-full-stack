import { Icon } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import React from 'react';
import type { IForm } from '../../api/forms';

interface QuoteFormProps {
  formState: IForm;
  isPreview?: boolean;
  isFocused?: boolean;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  formState,
  isPreview = false,
  isFocused = false,
}) => {
  const [view, setView] = React.useState<'form' | 'review' | 'success'>('form');

  const allFields = formState.steps.flatMap((step) => step.fields);

  const currentView = isFocused ? 'form' : view;

  if (currentView === 'success') {
    return (
      <div className="rq-success-screen" style={{ animation: 'successPop 0.5s ease-out' }}>
        <div className="rq-success-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Success"
          >
            <title>Success Icon</title>
            <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" />
            <path
              d="M9 12l2 2 4-4"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2>{formState.settings?.successTitle || 'Quote Requested Successfully!'}</h2>
        <p>
          {formState.settings?.successMessage ||
            'Thank you for your request. Our team will review your quote and get back to you shortly.'}
        </p>
        {!isFocused && (
          <button
            type="button"
            onClick={() => setView('form')}
            className="rq-submit-btn"
            style={{ maxWidth: '300px', margin: '32px auto 0' }}
          >
            Continue Shopping
          </button>
        )}
      </div>
    );
  }

  if (currentView === 'review') {
    return (
      <div className="rq-form-container" style={{ animation: 'slideIn 0.4s ease-out' }}>
        <div className="rq-form-header">
          <h2>Review Your Request</h2>
          <p>Please double check the information below before submitting.</p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            {
              id: 1,
              title: 'Sample Premium Product',
              variant: 'Default Variant / Black',
              sku: 'PRM-BLK-001',
              vendor: 'Premium Brand',
            },
            {
              id: 2,
              title: 'Minimalist Office Chair',
              variant: 'Ergonomic / White',
              sku: 'CHR-WHT-042',
              vendor: 'Design Studio',
            },
          ].map((product, idx) => (
            <div
              key={product.id}
              className="rq-product-hero"
              style={{ marginBottom: idx === 0 ? '16px' : '0' }}
            >
              <div className="rq-product-summary">
                <img
                  src={
                    idx === 0
                      ? 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'
                      : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png'
                  }
                  alt={product.title}
                  width="60"
                  height="60"
                />
                <div className="rq-product-info">
                  <span className="rq-product-title">{product.title}</span>
                  <span className="rq-product-variant">{product.variant}</span>
                  {formState.settings?.showVendor && (
                    <span style={{ fontSize: '12px', color: '#6d7175' }}>
                      Vendor: {product.vendor}
                    </span>
                  )}
                  {formState.settings?.showSku && (
                    <span style={{ fontSize: '12px', color: '#6d7175' }}>SKU: {product.sku}</span>
                  )}
                </div>
                {formState.settings?.showQuantity !== false && (
                  <div className="rq-review-qty" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <span className="rq-review-label">Quantity</span>
                    <span
                      className="rq-review-value"
                      style={{ fontSize: '18px', fontWeight: '700' }}
                    >
                      {idx === 0 ? '1' : '2'}
                    </span>
                  </div>
                )}
              </div>
              {formState.settings?.showProductNote && (
                <div
                  className="rq-product-note"
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f6f6f7',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#6d7175',
                    fontStyle: 'italic',
                  }}
                >
                  <strong>Note for {product.title}:</strong> Sample note for this specific item.
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rq-review-grid">
          {allFields.map((field) => (
            <div key={field.id} className="rq-review-item">
              <span className="rq-review-label">{field.label}</span>
              <span className="rq-review-value">
                {field.type === 'file'
                  ? 'image_sample.jpg'
                  : field.type === 'price'
                    ? '$1,200.00'
                    : 'Sample Response Value'}
              </span>
            </div>
          ))}
        </div>

        <div className="rq-btn-group" style={{ marginTop: '40px', width: '100%' }}>
          <button
            type="button"
            onClick={() => setView('form')}
            className="rq-submit-btn rq-back-btn"
            style={{ flex: 1 }}
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => setView('success')}
            className="rq-submit-btn rq-submit-final"
            style={{ flex: 2 }}
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rq-form-container" style={{ animation: 'slideIn 0.4s ease-out' }}>
      {/* Form Header */}
      <div className="rq-form-header">
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1c1d', marginBottom: '8px' }}>
          {formState.title || 'Request a Quote'}
        </h2>
        <p style={{ fontSize: '14px', color: '#6d7175' }}>
          {formState.description ||
            'Please fill in the information below and we will get back to you with a custom quote.'}
        </p>
      </div>

      {/* Form Fields */}
      <form className="rq-form" onSubmit={(e) => e.preventDefault()}>
        <div id="rq-step-input-preview">
          {/* Product Hero - Multiple Products Demo */}
          <div className="space-y-4 mb-6">
            {[
              {
                id: 1,
                title: 'Sample Premium Product',
                variant: 'Default Variant / Black',
                sku: 'PRM-BLK-001',
                vendor: 'Premium Brand',
              },
              {
                id: 2,
                title: 'Minimalist Office Chair',
                variant: 'Ergonomic / White',
                sku: 'CHR-WHT-042',
                vendor: 'Design Studio',
              },
            ].map((product, idx) => (
              <div
                key={product.id}
                className="rq-product-hero"
                style={{ marginBottom: idx === 0 ? '16px' : '0' }}
              >
                <div className="rq-product-summary">
                  <div className="rq-product-summary-image-wrapper">
                    <img
                      src={
                        idx === 0
                          ? 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'
                          : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png'
                      }
                      alt={product.title}
                      width="60"
                      height="60"
                    />
                  </div>
                  <div className="rq-product-info">
                    <span className="rq-product-title">{product.title}</span>
                    <span className="rq-product-variant">{product.variant}</span>
                    {formState.settings?.showVendor && (
                      <span style={{ fontSize: '12px', color: '#6d7175' }}>
                        Vendor: {product.vendor}
                      </span>
                    )}
                    {formState.settings?.showSku && (
                      <span style={{ fontSize: '12px', color: '#6d7175' }}>SKU: {product.sku}</span>
                    )}
                  </div>
                </div>

                {formState.settings?.showQuantity !== false && (
                  <div className="rq-quantity-container">
                    <label htmlFor={`qty-${product.id}`}>Quantity</label>
                    <div className="rq-qty-control-group">
                      <button type="button" className="rq-qty-adjust minus" disabled={isPreview}>
                        <svg
                          width="12"
                          height="2"
                          viewBox="0 0 12 2"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          role="img"
                          aria-label="Decrease quantity"
                        >
                          <title>Minus</title>
                          <path d="M0 1H12" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>
                      <input id={`qty-${product.id}`} type="number" value={idx === 0 ? '1' : '2'} readOnly />
                      <button type="button" className="rq-qty-adjust plus" disabled={isPreview}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          role="img"
                          aria-label="Increase quantity"
                        >
                          <title>Plus</title>
                          <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {formState.settings?.showProductNote && (
                  <div
                    className="rq-product-note"
                    style={{
                      gridColumn: 'span 2',
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f6f6f7',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#6d7175',
                      fontStyle: 'italic',
                      width: '100%',
                    }}
                  >
                    <strong>Note for {product.title}:</strong> Sample note for this specific item.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rq-step active">
            <div
              className="rq-form-sections-container"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {formState.steps.map((step, sIdx) => (
                <div
                  key={step.id || sIdx}
                  className="rq-form-section-card"
                  style={{
                    background: '#fff',
                    border: '1px solid #e1e3e5',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 20px',
                      background: '#f9fafb',
                      borderBottom: '1px solid #e1e3e5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '4px',
                        height: '16px',
                        background: '#000',
                        borderRadius: '2px',
                      }}
                    ></div>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#1a1c1d',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h4>
                    {step.description && (
                      <p style={{ fontSize: '11px', color: '#6d7175', margin: '2px 0 0' }}>
                        {step.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      padding: '24px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '20px',
                    }}
                  >
                    {step.fields.length === 0 ? (
                      <div
                        style={{
                          gridColumn: 'span 2',
                          textAlign: 'center',
                          padding: '20px',
                          opacity: 0.3,
                          fontSize: '12px',
                          fontStyle: 'italic',
                        }}
                      >
                        Empty section
                      </div>
                    ) : (
                      step.fields.map((field) => {
                        const isFullWidth =
                          field.type === 'textarea' ||
                          field.type === 'file' ||
                          field.type === 'heading';
                        return (
                          <div
                            key={field.id}
                            className="rq-input-group"
                            style={{ gridColumn: isFullWidth ? 'span 2' : 'span 1' }}
                          >
                            {field.type === 'heading' ? (
                              <h3
                                style={{
                                  fontSize: '20px',
                                  fontWeight: '800',
                                  color: '#1a1c1d',
                                  margin: '0 0 8px',
                                }}
                              >
                                {field.label}
                              </h3>
                            ) : (
                              <>
                                <label
                                  htmlFor={field.id}
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '6px',
                                    display: 'block',
                                  }}
                                >
                                  {field.label}{' '}
                                  {field.required && <span className="rq-required">*</span>}
                                </label>
                                {field.helpText && (
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      color: '#6d7175',
                                      marginTop: '-4px',
                                      marginBottom: '8px',
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    {field.helpText}
                                  </div>
                                )}
                                {field.type === 'textarea' ? (
                                  <textarea
                                    id={field.id}
                                    rows={isFocused ? 2 : 4}
                                    placeholder={
                                      field.placeholder || `Enter ${field.label.toLowerCase()}...`
                                    }
                                    disabled={isPreview}
                                    style={{ fontSize: '14px', padding: '10px 12px' }}
                                  />
                                ) : field.type === 'file' ? (
                                  <div
                                    id={field.id}
                                    className="rq-dropzone"
                                    style={{
                                      padding: isFocused ? '16px' : '32px',
                                      cursor: isPreview ? 'not-allowed' : 'pointer',
                                    }}
                                  >
                                    <div className="rq-dropzone-icon" style={{ opacity: 0.4 }}>
                                      <Icon source={ImageIcon} />
                                    </div>
                                    <div
                                      className="rq-dropzone-text"
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        marginTop: '4px',
                                      }}
                                    >
                                      Click to upload or drag
                                    </div>
                                  </div>
                                ) : field.type === 'price' ? (
                                  <div
                                    className="rq-input-currency"
                                    style={{ position: 'relative' }}
                                  >
                                    <span
                                      className="rq-currency-symbol"
                                      style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        opacity: 0.4,
                                      }}
                                    >
                                      $
                                    </span>
                                    <input
                                      id={field.id}
                                      type="number"
                                      placeholder="0.00"
                                      disabled={isPreview}
                                      style={{
                                        paddingLeft: '28px',
                                        fontSize: '14px',
                                        height: '42px',
                                      }}
                                    />
                                  </div>
                                ) : field.type === 'phone' ? (
                                  <div className="rq-input-icon" style={{ position: 'relative' }}>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      role="img"
                                      aria-label="Phone"
                                      style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        opacity: 0.4,
                                      }}
                                    >
                                      <title>Phone Icon</title>
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input
                                      id={field.id}
                                      type="tel"
                                      placeholder={field.placeholder || 'Phone number'}
                                      disabled={isPreview}
                                      style={{
                                        paddingLeft: '36px',
                                        fontSize: '14px',
                                        height: '42px',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <input
                                    id={field.id}
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    placeholder={
                                      field.placeholder || `Enter ${field.label.toLowerCase()}...`
                                    }
                                    disabled={isPreview}
                                    style={{
                                      fontSize: '14px',
                                      height: '42px',
                                      padding: '10px 12px',
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="rq-btn-group" style={{ marginTop: '32px' }}>
          <button
            type="button"
            onClick={() => setView('review')}
            className="rq-submit-btn"
            style={{
              width: '100%',
              background: '#000',
              borderRadius: '8px',
              fontWeight: '600',
              height: '48px',
            }}
          >
            Review Quote Request
          </button>
        </div>
      </form>
    </div>
  );
};
