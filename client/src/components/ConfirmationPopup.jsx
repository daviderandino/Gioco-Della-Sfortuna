import React from 'react';
import '../styles/ConfirmationPopup.css'; 

function ConfirmationPopup({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Conferma', 
  cancelText = 'Annulla'   
}) {
  if (!show) {
    return null;
  }

  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="popup-actions">
          <button onClick={onCancel} className="button-link modern-button secondary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="button-link modern-button primary-action">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPopup;
