class EmailBuilder {
    constructor() {
        this.blocks = [];
        this.templates = [];
        this.currentEmail = [];
        this.editingBlockIndex = null;
        
        this.initializeApp();
        this.bindEvents();
        this.loadData();
    }

    initializeApp() {
        // Initialize default data if empty
        if (!localStorage.getItem('emailBlocks')) {
            this.initializeDefaultData();
        }
    }

    initializeDefaultData() {
        const defaultBlocks = [
            { id: 1, text: "Beste [Naam],", category: "aanhef" },
            { id: 2, text: "Met vriendelijke groet,", category: "afsluiting" },
            { id: 3, text: "Hartelijk dank voor uw bericht.", category: "standaard" },
            { id: 4, text: "We nemen zo spoedig mogelijk contact met u op.", category: "standaard" },
            { id: 5, text: "Graag ontvang ik meer informatie over:", category: "vraag" }
        ];

        const defaultTemplates = [
            { 
                id: 1, 
                name: "Standaard reactie", 
                content: [
                    "Beste [Naam],",
                    "Hartelijk dank voor uw bericht.",
                    "We nemen zo spoedig mogelijk contact met u op.",
                    "Met vriendelijke groet,"
                ] 
            },
            { 
                id: 2, 
                name: "Offerte aanvraag", 
                content: [
                    "Beste [Naam],",
                    "Bedankt voor uw interesse in onze diensten.",
                    "We sturen u binnen 2 werkdagen een offerte toe.",
                    "Met vriendelijke groet,"
                ] 
            }
        ];

        localStorage.setItem('emailBlocks', JSON.stringify(defaultBlocks));
        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
    }

    loadData() {
        this.blocks = JSON.parse(localStorage.getItem('emailBlocks') || '[]');
        this.templates = JSON.parse(localStorage.getItem('emailTemplates') || '[]');
        
        this.renderBlocks();
        this.renderTemplates();
        this.renderEmail();
    }

    saveData() {
        localStorage.setItem('emailBlocks', JSON.stringify(this.blocks));
        localStorage.setItem('emailTemplates', JSON.stringify(this.templates));
    }

    bindEvents() {
        // Block management
        document.getElementById('addBlockBtn').addEventListener('click', () => this.addBlock());
        document.getElementById('newBlockText').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBlock();
        });

        // Template management
        document.getElementById('templateSelector').addEventListener('change', (e) => this.loadTemplate(e.target.value));
        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.showSaveTemplateModal());
        document.getElementById('confirmSaveBtn').addEventListener('click', () => this.saveTemplate());
        document.getElementById('cancelSaveBtn').addEventListener('click', () => this.hideSaveTemplateModal());

        // Email actions
        document.getElementById('copyBtn').addEventListener('click', () => this.copyEmail());
        document.getElementById('clearCanvasBtn').addEventListener('click', () => this.clearCanvas());

        // Text editor
        document.getElementById('saveTextBtn').addEventListener('click', () => this.saveEditedText());
        document.getElementById('cancelTextBtn').addEventListener('click', () => this.hideTextEditor());

        // Drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const emailCanvas = document.getElementById('emailCanvas');
        
        // Allow drop
        emailCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            emailCanvas.classList.add('drag-over');
        });

        emailCanvas.addEventListener('dragleave', () => {
            emailCanvas.classList.remove('drag-over');
        });

        emailCanvas.addEventListener('drop', (e) => {
            e.preventDefault();
            emailCanvas.classList.remove('drag-over');
            
            const blockId = e.dataTransfer.getData('text/plain');
            this.addBlockToEmail(parseInt(blockId));
        });
    }

    renderBlocks() {
        const blocksList = document.getElementById('blocksList');
        blocksList.innerHTML = '';

        this.blocks.forEach(block => {
            const blockElement = document.createElement('div');
            blockElement.className = 'block-item';
            blockElement.draggable = true;
            blockElement.textContent = block.text;
            blockElement.dataset.id = block.id;

            blockElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', block.id);
                blockElement.classList.add('dragging');
            });

            blockElement.addEventListener('dragend', () => {
                blockElement.classList.remove('dragging');
            });

            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Verwijder';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteBlock(block.id);
            });

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'block-actions';
            actionsDiv.appendChild(deleteBtn);
            
            blockElement.appendChild(actionsDiv);
            blocksList.appendChild(blockElement);
        });
    }

    renderTemplates() {
        const templateSelector = document.getElementById('templateSelector');
        templateSelector.innerHTML = '<option value="">Kies een template...</option>';

        this.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            templateSelector.appendChild(option);
        });
    }

    renderEmail() {
        const emailCanvas = document.getElementById('emailCanvas');
        
        if (this.currentEmail.length === 0) {
            emailCanvas.innerHTML = '<p class="empty-state">Sleep blokken hierheen om je e-mail te bouwen</p>';
            return;
        }

        emailCanvas.innerHTML = '';
        
        this.currentEmail.forEach((block, index) => {
            const blockElement = document.createElement('div');
            blockElement.className = 'email-block';
            blockElement.textContent = block.text;

            // Add edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Bewerk';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editBlockText(index);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Verwijder';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeBlockFromEmail(index);
            });

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'block-actions';
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            blockElement.appendChild(actionsDiv);
            emailCanvas.appendChild(blockElement);
        });
    }

    addBlock() {
        const newBlockText = document.getElementById('newBlockText').value.trim();
        
        if (!newBlockText) {
            alert('Voer tekst in voor het nieuwe blok');
            return;
        }

        const newBlock = {
            id: Date.now(),
            text: newBlockText,
            category: 'custom'
        };

        this.blocks.push(newBlock);
        this.saveData();
        this.renderBlocks();
        
        document.getElementById('newBlockText').value = '';
    }

    deleteBlock(blockId) {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            this.blocks = this.blocks.filter(block => block.id !== blockId);
            this.saveData();
            this.renderBlocks();
        }
    }

    addBlockToEmail(blockId) {
        const block = this.blocks.find(b => b.id === blockId);
        if (block) {
            this.currentEmail.push({...block});
            this.renderEmail();
        }
    }

    removeBlockFromEmail(index) {
        this.currentEmail.splice(index, 1);
        this.renderEmail();
    }

    editBlockText(index) {
        this.editingBlockIndex = index;
        const currentText = this.currentEmail[index].text;
        
        document.getElementById('textEditor').value = currentText;
        document.getElementById('textEditorModal').style.display = 'block';
    }

    saveEditedText() {
        if (this.editingBlockIndex !== null) {
            const newText = document.getElementById('textEditor').value.trim();
            if (newText) {
                this.currentEmail[this.editingBlockIndex].text = newText;
                this.renderEmail();
            }
            this.hideTextEditor();
        }
    }

    hideTextEditor() {
        document.getElementById('textEditorModal').style.display = 'none';
        this.editingBlockIndex = null;
    }

    loadTemplate(templateId) {
        if (!templateId) return;

        const template = this.templates.find(t => t.id == templateId);
        if (template) {
            this.currentEmail = template.content.map(text => ({
                id: Date.now() + Math.random(),
                text: text,
                category: 'template'
            }));
            this.renderEmail();
        }
    }

    showSaveTemplateModal() {
        if (this.currentEmail.length === 0) {
            alert('Er is geen e-mail om op te slaan als template');
            return;
        }
        document.getElementById('saveTemplateModal').style.display = 'block';
    }

    hideSaveTemplateModal() {
        document.getElementById('saveTemplateModal').style.display = 'none';
        document.getElementById('templateName').value = '';
    }

    saveTemplate() {
        const templateName = document.getElementById('templateName').value.trim();
        
        if (!templateName) {
            alert('Voer een naam in voor het template');
            return;
        }

        const newTemplate = {
            id: Date.now(),
            name: templateName,
            content: this.currentEmail.map(block => block.text)
        };

        this.templates.push(newTemplate);
        this.saveData();
        this.renderTemplates();
        this.hideSaveTemplateModal();
        
        alert('Template opgeslagen!');
    }

    copyEmail() {
        if (this.currentEmail.length === 0) {
            alert('Er is geen e-mail om te kopiëren');
            return;
        }

        const emailText = this.currentEmail.map(block => block.text).join('\n\n');
        
        navigator.clipboard.writeText(emailText).then(() => {
            alert('E-mail gekopieerd naar klembord!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = emailText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('E-mail gekopieerd naar klembord!');
        });
    }

    clearCanvas() {
        if (confirm('Weet je zeker dat je het canvas wilt leegmaken?')) {
            this.currentEmail = [];
            this.renderEmail();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmailBuilder();
});
