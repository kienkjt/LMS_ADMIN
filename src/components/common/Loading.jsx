import React from 'react';
import './Loading.css';

export const LoadingSpinner = ({ size = 'md', text = '' }) => (
  <div className={`loading-spinner-wrapper ${size}`}>
    <div className={`spinner spinner-${size}`}></div>
    {text && <p className="loading-text">{text}</p>}
  </div>
);

export const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-inner">
      <div className="loader-logo">E</div>
      <div className="loader-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ height: '180px', borderRadius: '12px 12px 0 0' }}></div>
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="skeleton" style={{ height: '14px', width: '60%' }}></div>
      <div className="skeleton" style={{ height: '20px' }}></div>
      <div className="skeleton" style={{ height: '14px', width: '80%' }}></div>
      <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
    </div>
  </div>
);

const Loading = ({ fullPage = false }) => {
  if (fullPage) return <PageLoader />;
  return (
    <div className="loading-center">
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;
