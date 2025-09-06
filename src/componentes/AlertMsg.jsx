
import React from "react";
import "./AlertMsg.css";
import { createPortal } from 'react-dom';

const AlertMsg = ({ 
    message, 
    type = 'info', 
    isConfirm = false, 
    onConfirm, 
    onCancel,
    confirmText = 'Sí',
    cancelText = 'No'
}) => {
  const alertContent=(
 <div className={`alert-overlay ${isConfirm ? 'confirm-overlay' : ''}`}>
            <div className={`alert-message ${type}-message ${isConfirm ? 'confirm-message' : ''}`}>
                <p>{message}</p>
                
                {isConfirm && (
                    // Botones para confirmación
                    <div className="alert-buttons">
                        <button 
                            className="alert-btn confirm-btn" 
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button 
                            className="alert-btn cancel-btn" 
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    </div>

                ) }
            </div>
 </div>
    );
    return createPortal(alertContent,document.body);
}

export default AlertMsg;