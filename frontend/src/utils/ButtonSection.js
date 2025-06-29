/**
 * ButtonSection Tool for EditorJS
 * Creates a section with industrial control panel
 */
import { createResource } from 'frappe-ui'

class ButtonSection {
    static get toolbox() {
      return {
        title: 'Industrial Panel',
        icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="12" rx="15"/><circle cx="84" cy="84" r="20" fill="#ff4444"/><circle cx="168" cy="84" r="20" fill="#44ff44"/><circle cx="252" cy="84" r="20" fill="#333"/><circle cx="84" cy="192" r="15" fill="#44ff44"/><circle cx="168" cy="192" r="15" fill="#44ff44"/><circle cx="252" cy="192" r="15" fill="#44ff44"/></svg>'
      };
    }
  
    static get isReadOnlySupported() {
      return true;
    }
  
    constructor({ data, config, api, readOnly }) {
      this.api = api;
      this.readOnly = readOnly;
      this.config = config || {};
      
      this.data = {
        title: data.title || 'HMI',
        panelType: data.panelType || 'industrial',
        buttons: data.buttons || [
          { id: '1', text: 'STOP', type: 'red', active: false },
          { id: '2', text: 'START', type: 'green', active: false },
          { id: '3', text: 'MODE', type: 'black', active: false },
          { id: '4', text: 'UP', type: 'green', active: false },
          { id: '5', text: 'DOWN', type: 'green', active: false },
          { id: '6', text: 'DOWN', type: 'red', active: false },
          { id: '7', text: 'LEFT', type: 'green', active: false },
          { id: '8', text: 'RIGHT', type: 'green', active: false }
        ]
      };
  
      this.wrapper = null;
      this.panelInstance = null;
      // Track active buttons for console logging
      this.activeButtons = new Set();
    }
  
    render() {
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('button-section-tool');
      
      if (this.readOnly) {
        this.wrapper.innerHTML = this._createReadOnlyHTML();
        this._initializePanel();
        return this.wrapper;
      }
  
      this.wrapper.innerHTML = this._createEditableHTML();
      this._bindEvents();
      this._initializePanel();
      
      return this.wrapper;
    }
  
    _createReadOnlyHTML() {
      return `
        <div class="industrial-panel-container">
          <div class="control-panel">
            <div class="status-indicator" id="statusLight-${this._generateId()}"></div>
            
            <div class="button-grid">
              <button class="control-button red-button" data-button="1">
                <span class="button-label">${this.data.buttons[0].text}</span>
              </button>
              <button class="control-button green-button" data-button="2">
                <span class="button-label">${this.data.buttons[1].text}</span>
              </button>
              <button class="control-button black-button" data-button="3">
                <span class="button-label">${this.data.buttons[2].text}</span>
              </button>
            </div>
            
            <div class="panel-title">${this.data.title}</div>
            
            <div class="display-screen"></div>
            
            <div class="bottom-row">
              <div style="display: flex; gap: 50px;">
                <button class="control-button green-button" data-button="4">
                  <span class="button-label">${this.data.buttons[3].text}</span>
                </button>
                <button class="control-button green-button" data-button="5">
                  <span class="button-label">${this.data.buttons[4].text}</span>
                </button>
                <button class="control-button red-button" data-button="6">
                  <span class="button-label">${this.data.buttons[5].text}</span>
                </button>
              </div>
              <div style="display: flex; gap: 50px;">
                <button class="control-button green-button" data-button="7">
                  <span class="button-label">${this.data.buttons[6].text}</span>
                </button>
                <button class="control-button green-button" data-button="8">
                  <span class="button-label">${this.data.buttons[7].text}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  
    _createEditableHTML() {
      const buttonsHTML = this.data.buttons.map((button, index) => `
        <div class="button-editor" data-index="${index}">
          <label>Button ${index + 1}:</label>
          <input type="text" class="button-text" value="${button.text}" placeholder="Button label">
          <select class="button-type">
            <option value="red" ${button.type === 'red' ? 'selected' : ''}>Red</option>
            <option value="green" ${button.type === 'green' ? 'selected' : ''}>Green</option>
            <option value="black" ${button.type === 'black' ? 'selected' : ''}>Black</option>
          </select>
        </div>
      `).join('');
  
      return `
        <div class="button-section-editor">
          <div class="editor-section">
            <label>Panel Title:</label>
            <input type="text" class="section-title" value="${this.data.title}" placeholder="Panel title">
          </div>
          
          <div class="buttons-config">
            <h4>Button Configuration:</h4>
            ${buttonsHTML}
          </div>
          
          <div class="panel-preview">
            <h4>Preview:</h4>
            <div class="industrial-panel-container">
              <div class="control-panel">
                <div class="status-indicator" id="statusLight-${this._generateId()}"></div>
                
                <div class="button-grid">
                  <button class="control-button red-button" data-button="1">
                    <span class="button-label">${this.data.buttons[0].text}</span>
                  </button>
                  <button class="control-button green-button" data-button="2">
                    <span class="button-label">${this.data.buttons[1].text}</span>
                  </button>
                  <button class="control-button black-button" data-button="3">
                    <span class="button-label">${this.data.buttons[2].text}</span>
                  </button>
                </div>
                
                <div class="panel-title">${this.data.title}</div>
                
                <div class="display-screen"></div>
                
                <div class="bottom-row">
                  <div style="display: flex; gap: 50px;">
                    <button class="control-button green-button" data-button="4">
                      <span class="button-label">${this.data.buttons[3].text}</span>
                    </button>
                    <button class="control-button green-button" data-button="5">
                      <span class="button-label">${this.data.buttons[4].text}</span>
                    </button>
                    <button class="control-button red-button" data-button="6">
                      <span class="button-label">${this.data.buttons[5].text}</span>
                    </button>
                  </div>
                  <div style="display: flex; gap: 50px;">
                    <button class="control-button green-button" data-button="7">
                      <span class="button-label">${this.data.buttons[6].text}</span>
                    </button>
                    <button class="control-button green-button" data-button="8">
                      <span class="button-label">${this.data.buttons[7].text}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  
    _bindEvents() {
      const titleInput = this.wrapper.querySelector('.section-title');
      const buttonInputs = this.wrapper.querySelectorAll('.button-text, .button-type');
  
      titleInput.addEventListener('input', (e) => {
        this.data.title = e.target.value;
        this._updatePreview();
      });
  
      buttonInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
          this._updateButtonData();
          this._updatePreview();
        });
      });
    }
  
    _updateButtonData() {
      const buttonEditors = this.wrapper.querySelectorAll('.button-editor');
      buttonEditors.forEach((editor, index) => {
        const textInput = editor.querySelector('.button-text');
        const typeSelect = editor.querySelector('.button-type');
        
        if (this.data.buttons[index]) {
          this.data.buttons[index].text = textInput.value;
          this.data.buttons[index].type = typeSelect.value;
        }
      });
    }
  
    _updatePreview() {
      const preview = this.wrapper.querySelector('.panel-preview .control-panel');
      if (preview) {
        const title = preview.querySelector('.panel-title');
        const buttonLabels = preview.querySelectorAll('.button-label');
        
        title.textContent = this.data.title;
        buttonLabels.forEach((label, index) => {
          if (this.data.buttons[index]) {
            label.textContent = this.data.buttons[index].text;
          }
        });
        
        // Update button colors based on type
        const buttons = preview.querySelectorAll('.control-button');
        buttons.forEach((button, index) => {
          if (this.data.buttons[index]) {
            button.className = `control-button ${this.data.buttons[index].type}-button`;
          }
        });
        
        // Reinitialize panel functionality
        this._initializePanel();
      }
    }
  
    _initializePanel() {
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        const panels = this.wrapper.querySelectorAll('.control-panel');
        panels.forEach(panel => {
          if (!panel.dataset.initialized) {
            this._initializePanelInstance(panel);
            panel.dataset.initialized = 'true';
          }
        });
      }, 100);
    }
  
    _initializePanelInstance(panel) {
      const buttons = panel.querySelectorAll('.control-button');
      const statusLight = panel.querySelector('.status-indicator');
      const activeButtons = new Set();
  
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const buttonId = button.dataset.button;
          const buttonData = this.data.buttons[parseInt(buttonId) - 1];
          
          // Add click animation
          button.style.transform = 'translateY(4px)';
          setTimeout(() => {
            button.style.transform = '';
          }, 150);
  
          // Toggle button state
          const wasActive = activeButtons.has(buttonId);
          
          if (wasActive) {
            button.classList.remove('active');
            activeButtons.delete(buttonId);
          } else {
            button.classList.add('active');
            activeButtons.add(buttonId);
            
            // Special behavior for STOP button
            if (buttonId === '1') {
              buttons.forEach(btn => {
                if (btn.dataset.button !== '1') {
                  btn.classList.remove('active');
                  activeButtons.delete(btn.dataset.button);
                }
              });
            }
            
            // Special behavior for START button
            if (buttonId === '2' && activeButtons.has('1')) {
              const stopButton = panel.querySelector('[data-button="1"]');
              stopButton.classList.remove('active');
              activeButtons.delete('1');
            }
          }
  
          // Update status light
          if (activeButtons.size > 0) {
            statusLight.classList.add('active');
          } else {
            statusLight.classList.remove('active');
          }
          
          // Console logging for button click and status
          this._logButtonClick(buttonId, buttonData, !wasActive, activeButtons);
          
          // Create ripple effect
          this._createRippleEffect(button, e);
        });
      });
    }
  
    _logButtonClick(buttonId, buttonData, isActive, activeButtons) {
        console.log("vvvvvvvvvvssss");
      const timestamp = new Date().toISOString();
      if (buttonId === '3') {
        let todos = createResource({
            url: '/api/method/lms.api.create_Virtual_world',
            
            })
            todos.fetch()
      }
      else if (buttonId === '2') {
        let todos = createResource({
            url: '/api/method/lms.api.update_Virtual_world',
            params: {
                status: 'Active',
                
              },
            })
            todos.fetch()
      }
      else if (buttonId === '1') {
        let todos = createResource({    
            url: '/api/method/lms.api.update_Virtual_world',
            params: {
                status: 'Stop',
                
              },
            })
            todos.fetch()
      }
        
      // Log the clicked button
      console.log(`🔘 Button Clicked:`, {
        timestamp: timestamp,
        buttonId: buttonId,
        buttonText: buttonData.text,
        buttonType: buttonData.type,
        newStatus: isActive ? 'ACTIVE' : 'INACTIVE',
        panelTitle: this.data.title
      });
      
      // Log all button statuses
      const allButtonStatuses = this.data.buttons.map((button, index) => {
        const id = (index + 1).toString();
        return {
          id: id,
          text: button.text,
          type: button.type,
          active: activeButtons.has(id)
        };
      });
      
      console.log(`📊 All Button Statuses:`, {
        timestamp: timestamp,
        panelTitle: this.data.title,
        totalActiveButtons: activeButtons.size,
        buttons: allButtonStatuses
      });
      
      // Log active buttons summary
      const activeButtonsList = Array.from(activeButtons).map(id => {
        const buttonData = this.data.buttons[parseInt(id) - 1];
        return `${buttonData.text} (ID: ${id})`;
      });
      
      console.log(`✅ Active Buttons Summary:`, {
        timestamp: timestamp,
        count: activeButtons.size,
        activeButtons: activeButtonsList.length > 0 ? activeButtonsList : 'None'
      });
      
      // Log separator for readability
      console.log('─'.repeat(50));
    }
  
    _createRippleEffect(button, event) {
      const ripple = document.createElement('div');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 10;
      `;

      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  
    _generateId() {
      return Math.random().toString(36).substr(2, 9);
    }
  
    save() {
      return this.data;
    }
  
    static get sanitize() {
      return {
        title: {},
        panelType: {},
        buttons: {
          id: {},
          text: {},
          type: {},
          active: {}
        }
      };
    }
}

// Enhanced CSS styles for the Industrial ButtonSection tool
const industrialButtonSectionStyles = `
<style>
.button-section-tool {
  margin: 1rem 0;
}

.button-section-editor {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  margin-bottom: 1rem;
}

.editor-section {
  margin-bottom: 1rem;
}

.editor-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.section-title {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.buttons-config h4 {
  margin-bottom: 1rem;
  color: #333;
}

.button-editor {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.button-editor label {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.button-text {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.button-type {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.panel-preview {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
}

.panel-preview h4 {
  margin-bottom: 1rem;
  color: #333;
}

/* Industrial Panel Styles - Updated to match HTML version */
.industrial-panel-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  margin: 1rem 0;
}

.control-panel {
  background: linear-gradient(145deg, #2a4d4d, #1a3333);
  border: 8px solid #0a1a1a;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  min-width: 300px;
}

.control-panel::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, #333, #666, #333);
  border-radius: 20px;
  z-index: -1;
}

.panel-title {
  color: #ff4444;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 5px #ff4444;
  letter-spacing: 2px;
}

.display-screen {
  background: linear-gradient(135deg, #4a4a4a, #2a2a2a);
  border: 3px solid #1a1a1a;
  border-radius: 8px;
  width: 120px;
  height: 80px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 0 10px rgba(0, 0, 0, 0.8),
    0 0 5px rgba(0, 255, 255, 0.3);
  position: relative;
}

.display-screen::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
  border-radius: 4px;
  pointer-events: none;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.control-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  overflow: hidden;
}

.control-button::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.control-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: all 0.3s ease;
}

/* Different button sizes like in HTML */
.button-grid .green-button {
  width: 30px;
  height: 30px;
}

.button-grid .red-button {
  width: 40px;
  height: 40px;
}

.button-grid .black-button {
  width: 20px;
  height: 20px;
}

.red-button {
  background: linear-gradient(145deg, #ff4444, #cc2222);
  box-shadow: 
    0 4px 8px rgba(255, 68, 68, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    0 0 15px rgba(255, 68, 68, 0.2);
}

.green-button {
  background: linear-gradient(145deg, #44ff44, #22cc22);
  box-shadow: 
    0 4px 8px rgba(68, 255, 68, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    0 0 15px rgba(68, 255, 68, 0.2);
}

.black-button {
  background: linear-gradient(145deg, #333333, #111111);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.control-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.control-button:hover::before {
  opacity: 1;
}

.control-button.active {
  transform: translateY(2px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 4px 8px rgba(0, 0, 0, 0.3);
  filter: brightness(1.3) saturate(1.2);
}

.control-button.active::after {
  opacity: 1;
  animation: pulse 1.5s infinite;
}

.red-button.active {
  box-shadow: 
    0 2px 4px rgba(255, 68, 68, 0.5),
    inset 0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(255, 68, 68, 0.6);
}

.green-button.active {
  box-shadow: 
    0 2px 4px rgba(68, 255, 68, 0.5),
    inset 0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(68, 255, 68, 0.6);
}

.black-button.active {
  box-shadow: 
    0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 4px 8px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(255, 255, 255, 0.3);
}

.bottom-row {
  gap: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: auto;
}

.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #00ff00;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(0, 255, 0, 0.8);
  animation: blink 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

.button-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: #888;
  font-size: 10px;
  white-space: nowrap;
}

.control-button.active .button-label {
  color: #fff;
  text-shadow: 0 0 5px currentColor;
}
</style>
`;

// Add styles to document head
if (!document.querySelector('#industrial-button-section-styles')) {
  const styleElement = document.createElement('div');
  styleElement.id = 'industrial-button-section-styles';
  styleElement.innerHTML = industrialButtonSectionStyles;
  document.head.appendChild(styleElement);
}

export default ButtonSection;