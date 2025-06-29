import { createResource } from 'frappe-ui'

class AddCustomButtons {
    static get toolbox() {
      return {
        title: 'Machine Controls',
        icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 103-32zm0 52l-103 32-81-72-67 44v42c0 19 15 34 34 34h178c19 0 34-15 34-34v-46z"/><rect x="0" y="0" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="12" rx="15"/><rect x="60" y="60" width="80" height="25" fill="currentColor" rx="12"/><rect x="190" y="60" width="80" height="25" fill="currentColor" rx="12"/><rect x="60" y="120" width="80" height="25" fill="currentColor" rx="12"/><rect x="190" y="120" width="80" height="25" fill="currentColor" rx="12"/></svg>'
      };
    }
  
    constructor({ data, config, api }) {
      this.api = api;
      this.config = config || {};
  
      this.data = {
        title: data.title || 'Machine Management',
        buttons: [
          { text: 'Create Machine', style: 'create', icon: '⚡' },
          { text: 'Update Machine', style: 'update', icon: '🔄' }
        ]
      };
  
      this.wrapper = null;
    }
  
    render() {
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('button-section-tool');
      this.wrapper.innerHTML = this._createReadOnlyHTML();
      this._bindClickEvents();
      this._appendStyles();
      return this.wrapper;
    }
  
    _createReadOnlyHTML() {
      const buttonsHTML = this.data.buttons.map((button, index) => {
        const styleClass = `btn-${button.style}`;
        return `
          <button class="machine-btn ${styleClass}" data-index="${index}">
            <span class="btn-icon">${button.icon}</span>
            <span class="btn-text">${button.text}</span>
            <span class="btn-loader" style="display: none;">
              <div class="spinner"></div>
            </span>
          </button>
        `;
      }).join('');
  
      return `
        <div class="machine-section">
          <h3 class="machine-section-title">${this.data.title}</h3>
          <div class="machine-section-buttons">
            ${buttonsHTML}
          </div>
          <div class="status-message" id="statusMessage" style="display: none;"></div>
        </div>
      `;
    }
  
    _showMessage(message, type) {
      const statusElement = this.wrapper.querySelector('#statusMessage');
      statusElement.className = `status-message ${type}`;
      statusElement.innerHTML = `
        <div class="message-content">
          <span class="message-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
          <span class="message-text">${message}</span>
        </div>
      `;
      statusElement.style.display = 'block';
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 5000);
    }
  
    _setButtonLoading(buttonIndex, isLoading) {
      const button = this.wrapper.querySelector(`[data-index="${buttonIndex}"]`);
      const icon = button.querySelector('.btn-icon');
      const text = button.querySelector('.btn-text');
      const loader = button.querySelector('.btn-loader');
      
      if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        icon.style.display = 'none';
        text.style.display = 'none';
        loader.style.display = 'inline-block';
      } else {
        button.disabled = false;
        button.classList.remove('loading');
        icon.style.display = 'inline-block';
        text.style.display = 'inline-block';
        loader.style.display = 'none';
      }
    }
  
    _bindClickEvents() {
      const buttons = this.wrapper.querySelectorAll('.machine-btn');
      buttons.forEach((button, buttonIndex) => {
        button.addEventListener('click', async () => {
          this._setButtonLoading(buttonIndex, true);
          
          try {
            if (buttonIndex === 0) {
              // Create Machine
              const machineCreateResource = createResource({
                url: '/api/method/lms.api.create_machine',
              });
              
              const createResult = await machineCreateResource.fetch();
              
              if (createResult && createResult.error) {
                this._showMessage(createResult.error, 'error');
              } else {
                this._showMessage('Machine created successfully', 'success');
              }
              
            } else if (buttonIndex === 1) {
              // Update Machine
              const machineUpdateResource = createResource({    
                url: '/api/method/lms.api.update_machine',
                params: {
                  status: 'Updated',
                },
              });
              
              const updateResult = await machineUpdateResource.fetch();
              
              if (updateResult && updateResult.error) {
                this._showMessage(updateResult.error, 'error');
              } else {
                this._showMessage('Machine updated successfully', 'success');
              }
            }
          } catch (error) {
            this._showMessage('An unexpected error occurred: ' + (error.message || error), 'error');
            console.error('Machine operation error:', error);
          } finally {
            this._setButtonLoading(buttonIndex, false);
          }
        });
      });
    }
  
    _appendStyles() {
      if (!document.querySelector('#machine-section-styles')) {
        const style = document.createElement('style');
        style.id = 'machine-section-styles';
        style.innerHTML = `
          .button-section-tool {
            margin: 1.5rem 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
  
          .machine-section {
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            padding: 2rem;
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
  
          .machine-section-title {
            margin: 0 0 1.5rem 0;
            font-size: 1.375rem;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.75rem;
          }
  
          .machine-section-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 1rem;
          }
  
          .machine-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            border-radius: 8px;
            border: 2px solid transparent;
            font-weight: 600;
            font-size: 0.95rem;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            min-width: 160px;
            justify-content: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
  
          .machine-btn:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }
  
          .btn-create {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-color: #059669;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
  
          .btn-create:hover:not(:disabled) {
            background: linear-gradient(135deg, #059669, #047857);
            border-color: #047857;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
          }
  
          .btn-update {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border-color: #2563eb;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
  
          .btn-update:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border-color: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          }
  
          .btn-icon {
            font-size: 1.1rem;
          }
  
          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
  
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
  
          .status-message {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
          }
  
          .status-message.success {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            border: 2px solid #10b981;
            color: #065f46;
          }
  
          .status-message.error {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            border: 2px solid #ef4444;
            color: #991b1b;
          }
  
          .status-message.info {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            border: 2px solid #3b82f6;
            color: #1e40af;
          }
  
          .message-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
  
          .message-icon {
            font-size: 1.25rem;
          }
  
          .message-text {
            flex: 1;
            font-size: 0.95rem;
          }
  
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
  
          @media (max-width: 640px) {
            .machine-section {
              padding: 1.5rem 1rem;
            }
            
            .machine-section-buttons {
              flex-direction: column;
            }
            
            .machine-btn {
              min-width: auto;
              width: 100%;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  
    save() {
      return this.data;
    }
  
    static get isReadOnlySupported() {
      return true;
    }
  
    static get sanitize() {
      return {
        title: {},
        buttons: {
          text: {},
          style: {},
          icon: {}
        }
      };
    }
  }
  
  export default AddCustomButtons;