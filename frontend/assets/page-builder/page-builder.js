/**
 * ==========================================
 * PAGE BUILDER - Pure JavaScript
 * Drag & Drop Page Builder Library
 * ==========================================
 */

class PageBuilder {
    constructor(canvasId = 'canvas') {
        this.canvas = document.getElementById(canvasId);
        this.selectedElement = null;
        this.elements = [];
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.currentDevice = 'desktop';
        this.previewMode = false;

        this.init();
    }

    /**
     * Inicializa o Page Builder
     */
    init() {
        this.setupDragAndDrop();
        this.setupCanvasInteraction();
        this.setupToolbar();
        this.setupDeviceSwitcher();
        this.removeEmptyState();
    }

    /**
     * ==========================================
     * DRAG AND DROP
     * ==========================================
     */
    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.pb-widget');

        widgets.forEach(widget => {
            widget.addEventListener('dragstart', (e) => this.handleDragStart(e));
            widget.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
        this.canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    handleDragStart(e) {
        console.log('🎯 Drag Start:', e.target.dataset.widgetType);
        const widgetType = e.target.dataset.widgetType || e.target.closest('.pb-widget')?.dataset?.widgetType;

        if (!widgetType) {
            console.warn('⚠️ Widget type não encontrado');
            return;
        }

        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', widgetType); // Fallback
        e.dataTransfer.setData('widgetType', widgetType);
        e.target.classList.add('dragging-widget');
    }

    handleDragEnd(e) {
        console.log('🎯 Drag End');
        e.target.classList.remove('dragging-widget');
        // Remover classe de todos os elementos
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';

        const dropZone = e.target.closest('.pb-canvas');
        if (dropZone && !dropZone.classList.contains('drag-over')) {
            dropZone.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('pb-canvas')) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        console.log('🎯 Drop detectado');
        e.preventDefault();
        e.stopPropagation();

        this.canvas.classList.remove('drag-over');

        const widgetType = e.dataTransfer.getData('widgetType') || e.dataTransfer.getData('text/plain');

        if (widgetType) {
            console.log('✅ Adicionando widget:', widgetType);
            this.addElement(widgetType);
        } else {
            console.warn('⚠️ Widget type não encontrado no drop');
        }
    }

    /**
     * ==========================================
     * CRIAÇÃO DE ELEMENTOS
     * ==========================================
     */
    addElement(type, data = {}) {
        this.removeEmptyState();

        const element = this.createElement(type, data);
        const elementWrapper = this.createElementWrapper(element, type);

        this.canvas.appendChild(elementWrapper);
        this.elements.push({
            id: elementWrapper.id,
            type: type,
            data: data,
            element: elementWrapper
        });

        this.saveHistory();
        return elementWrapper;
    }

    createElement(type, data) {
        const templates = {
            heading: () => {
                const level = data.level || 'h2';
                const text = data.text || 'Seu Título Aqui';
                const heading = document.createElement(level);
                heading.textContent = text;
                heading.style.textAlign = data.align || 'left';
                heading.style.color = data.color || '#1f2937';
                return heading;
            },

            text: () => {
                const p = document.createElement('p');
                p.textContent = data.text || 'Clique para editar este texto. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
                p.style.textAlign = data.align || 'left';
                p.style.color = data.color || '#6b7280';
                p.style.fontSize = data.fontSize || '16px';
                return p;
            },

            image: () => {
                const img = document.createElement('img');
                img.src = data.src || 'https://via.placeholder.com/800x400?text=Clique+para+adicionar+imagem';
                img.alt = data.alt || 'Imagem';
                img.style.width = data.width || '100%';
                img.style.borderRadius = data.borderRadius || '0px';
                return img;
            },

            button: () => {
                const btn = document.createElement('button');
                btn.textContent = data.text || 'Clique Aqui';
                btn.style.background = data.background || '#6366f1';
                btn.style.color = data.color || '#ffffff';
                btn.style.padding = data.padding || '12px 24px';
                btn.style.borderRadius = data.borderRadius || '6px';
                btn.style.fontSize = data.fontSize || '16px';
                btn.style.fontWeight = data.fontWeight || '600';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';

                const container = document.createElement('div');
                container.style.textAlign = data.align || 'left';
                container.appendChild(btn);
                return container;
            },

            divider: () => {
                const hr = document.createElement('hr');
                hr.style.borderTop = `${data.height || '2px'} ${data.style || 'solid'} ${data.color || '#e5e7eb'}`;
                hr.style.border = 'none';
                hr.style.borderTop = `${data.height || '2px'} ${data.style || 'solid'} ${data.color || '#e5e7eb'}`;
                hr.style.margin = `${data.margin || '20px'} 0`;
                return hr;
            },

            spacer: () => {
                const spacer = document.createElement('div');
                spacer.style.height = data.height || '50px';
                spacer.style.background = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.02) 10px, rgba(0, 0, 0, 0.02) 20px)';
                return spacer;
            },

            section: () => {
                const section = document.createElement('section');
                section.style.padding = data.padding || '40px 20px';
                section.style.background = data.background || '#ffffff';
                section.innerHTML = '<p style="color: #9ca3af; text-align: center;">Arraste elementos aqui</p>';
                return section;
            },

            container: () => {
                const container = document.createElement('div');
                container.style.maxWidth = data.maxWidth || '1200px';
                container.style.margin = '0 auto';
                container.style.padding = data.padding || '20px';
                container.innerHTML = '<p style="color: #9ca3af; text-align: center;">Container - Arraste elementos aqui</p>';
                return container;
            },

            columns: () => {
                const cols = parseInt(data.columns) || 2;
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.gap = data.gap || '20px';

                for (let i = 0; i < cols; i++) {
                    const col = document.createElement('div');
                    col.className = 'pb-column';
                    col.style.flex = '1';
                    col.style.border = '2px dashed #e5e7eb';
                    col.style.minHeight = '100px';
                    col.style.padding = '20px';
                    col.innerHTML = `<p style="color: #9ca3af; text-align: center;">Coluna ${i + 1}</p>`;
                    container.appendChild(col);
                }

                return container;
            },

            video: () => {
                const video = document.createElement('video');
                video.src = data.src || '';
                video.controls = true;
                video.style.width = data.width || '100%';
                video.style.borderRadius = data.borderRadius || '0px';

                if (!data.src) {
                    const placeholder = document.createElement('div');
                    placeholder.style.background = '#f3f4f6';
                    placeholder.style.padding = '60px 20px';
                    placeholder.style.textAlign = 'center';
                    placeholder.style.color = '#9ca3af';
                    placeholder.style.borderRadius = '8px';
                    placeholder.innerHTML = '▶ Adicionar URL do vídeo';
                    return placeholder;
                }

                return video;
            },

            gallery: () => {
                const gallery = document.createElement('div');
                gallery.className = 'pb-gallery-grid';
                gallery.style.display = 'grid';
                gallery.style.gridTemplateColumns = `repeat(${data.columns || 3}, 1fr)`;
                gallery.style.gap = data.gap || '15px';

                const images = data.images || [
                    'https://via.placeholder.com/300?text=Imagem+1',
                    'https://via.placeholder.com/300?text=Imagem+2',
                    'https://via.placeholder.com/300?text=Imagem+3'
                ];

                images.forEach((src, index) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `Galeria ${index + 1}`;
                    img.style.width = '100%';
                    img.style.height = '200px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';
                    gallery.appendChild(img);
                });

                return gallery;
            }
        };

        const template = templates[type];
        return template ? template() : document.createElement('div');
    }

    createElementWrapper(content, type) {
        const wrapper = document.createElement('div');
        wrapper.className = `pb-element pb-element-${type}`;
        wrapper.id = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        wrapper.draggable = true;

        // Adiciona controles
        const controls = this.createElementControls();
        wrapper.appendChild(controls);
        wrapper.appendChild(content);

        // Event listeners
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(wrapper);
        });

        wrapper.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('elementId', wrapper.id);
            wrapper.classList.add('dragging');
        });

        wrapper.addEventListener('dragend', (e) => {
            wrapper.classList.remove('dragging');
        });

        return wrapper;
    }

    createElementControls() {
        const controls = document.createElement('div');
        controls.className = 'pb-element-controls';
        controls.innerHTML = `
            <button class="pb-control-edit" title="Editar">✎</button>
            <button class="pb-control-duplicate" title="Duplicar">⧉</button>
            <button class="pb-control-delete" title="Excluir">🗑</button>
        `;

        controls.querySelector('.pb-control-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(controls.parentElement);
        });

        controls.querySelector('.pb-control-duplicate').addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicateElement(controls.parentElement);
        });

        controls.querySelector('.pb-control-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteElement(controls.parentElement);
        });

        return controls;
    }

    /**
     * ==========================================
     * INTERAÇÃO COM CANVAS
     * ==========================================
     */
    setupCanvasInteraction() {
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) {
                this.deselectElement();
            }
        });
    }

    selectElement(element) {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }

        this.selectedElement = element;
        element.classList.add('selected');
        this.showProperties(element);
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
        }
        this.hideProperties();
    }

    duplicateElement(element) {
        const clone = element.cloneNode(true);
        clone.id = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        element.parentNode.insertBefore(clone, element.nextSibling);

        // Re-adicionar event listeners
        this.reattachEventListeners(clone);
        this.saveHistory();
    }

    deleteElement(element) {
        if (confirm('Deseja realmente excluir este elemento?')) {
            if (this.selectedElement === element) {
                this.deselectElement();
            }
            element.remove();

            // Remove do array de elementos
            this.elements = this.elements.filter(el => el.id !== element.id);

            this.saveHistory();
            this.checkEmptyState();
        }
    }

    reattachEventListeners(wrapper) {
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(wrapper);
        });

        const controls = wrapper.querySelector('.pb-element-controls');

        controls.querySelector('.pb-control-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(wrapper);
        });

        controls.querySelector('.pb-control-duplicate').addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicateElement(wrapper);
        });

        controls.querySelector('.pb-control-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteElement(wrapper);
        });
    }

    /**
     * ==========================================
     * PAINEL DE PROPRIEDADES
     * ==========================================
     */
    showProperties(element) {
        const panel = document.getElementById('propertiesPanel');
        const content = document.getElementById('propertiesContent');

        panel.classList.add('active');

        const type = this.getElementType(element);
        const properties = this.generatePropertiesForm(element, type);

        content.innerHTML = properties;

        // Adicionar event listeners aos inputs
        this.attachPropertyListeners(element);
    }

    hideProperties() {
        const panel = document.getElementById('propertiesPanel');
        panel.classList.remove('active');
    }

    getElementType(element) {
        const classes = element.className.split(' ');
        const typeClass = classes.find(cls => cls.startsWith('pb-element-'));
        return typeClass ? typeClass.replace('pb-element-', '') : 'unknown';
    }

    generatePropertiesForm(element, type) {
        const forms = {
            heading: (el) => {
                const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
                return `
                    <div class="pb-property-group">
                        <label class="pb-property-label">Texto</label>
                        <input type="text" id="prop-text" value="${heading.textContent}" />
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Nível</label>
                        <select id="prop-level">
                            <option value="h1" ${heading.tagName === 'H1' ? 'selected' : ''}>H1</option>
                            <option value="h2" ${heading.tagName === 'H2' ? 'selected' : ''}>H2</option>
                            <option value="h3" ${heading.tagName === 'H3' ? 'selected' : ''}>H3</option>
                            <option value="h4" ${heading.tagName === 'H4' ? 'selected' : ''}>H4</option>
                            <option value="h5" ${heading.tagName === 'H5' ? 'selected' : ''}>H5</option>
                            <option value="h6" ${heading.tagName === 'H6' ? 'selected' : ''}>H6</option>
                        </select>
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Alinhamento</label>
                        <select id="prop-align">
                            <option value="left" ${heading.style.textAlign === 'left' ? 'selected' : ''}>Esquerda</option>
                            <option value="center" ${heading.style.textAlign === 'center' ? 'selected' : ''}>Centro</option>
                            <option value="right" ${heading.style.textAlign === 'right' ? 'selected' : ''}>Direita</option>
                        </select>
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Cor</label>
                        <input type="color" id="prop-color" value="${this.rgbToHex(heading.style.color) || '#1f2937'}" />
                    </div>
                `;
            },

            text: (el) => {
                const p = el.querySelector('p');
                return `
                    <div class="pb-property-group">
                        <label class="pb-property-label">Texto</label>
                        <textarea id="prop-text">${p.textContent}</textarea>
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Alinhamento</label>
                        <select id="prop-align">
                            <option value="left" ${p.style.textAlign === 'left' ? 'selected' : ''}>Esquerda</option>
                            <option value="center" ${p.style.textAlign === 'center' ? 'selected' : ''}>Centro</option>
                            <option value="right" ${p.style.textAlign === 'right' ? 'selected' : ''}>Direita</option>
                        </select>
                    </div>
                    <div class="pb-property-row">
                        <div class="pb-property-group">
                            <label class="pb-property-label">Tamanho</label>
                            <input type="number" id="prop-fontsize" value="${parseInt(p.style.fontSize) || 16}" min="10" max="72" />
                        </div>
                        <div class="pb-property-group">
                            <label class="pb-property-label">Cor</label>
                            <input type="color" id="prop-color" value="${this.rgbToHex(p.style.color) || '#6b7280'}" />
                        </div>
                    </div>
                `;
            },

            image: (el) => {
                const img = el.querySelector('img');
                return `
                    <div class="pb-property-group">
                        <label class="pb-property-label">URL da Imagem</label>
                        <input type="url" id="prop-src" value="${img.src}" />
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Texto Alternativo</label>
                        <input type="text" id="prop-alt" value="${img.alt}" />
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Largura (%)</label>
                        <input type="number" id="prop-width" value="${parseInt(img.style.width) || 100}" min="10" max="100" />
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Borda Arredondada (px)</label>
                        <input type="number" id="prop-radius" value="${parseInt(img.style.borderRadius) || 0}" min="0" max="50" />
                    </div>
                `;
            },

            button: (el) => {
                const btn = el.querySelector('button');
                return `
                    <div class="pb-property-group">
                        <label class="pb-property-label">Texto</label>
                        <input type="text" id="prop-text" value="${btn.textContent}" />
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Alinhamento</label>
                        <select id="prop-align">
                            <option value="left" ${el.style.textAlign === 'left' ? 'selected' : ''}>Esquerda</option>
                            <option value="center" ${el.style.textAlign === 'center' ? 'selected' : ''}>Centro</option>
                            <option value="right" ${el.style.textAlign === 'right' ? 'selected' : ''}>Direita</option>
                        </select>
                    </div>
                    <div class="pb-property-row">
                        <div class="pb-property-group">
                            <label class="pb-property-label">Cor Fundo</label>
                            <input type="color" id="prop-bg" value="${this.rgbToHex(btn.style.background) || '#6366f1'}" />
                        </div>
                        <div class="pb-property-group">
                            <label class="pb-property-label">Cor Texto</label>
                            <input type="color" id="prop-color" value="${this.rgbToHex(btn.style.color) || '#ffffff'}" />
                        </div>
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Borda Arredondada (px)</label>
                        <input type="number" id="prop-radius" value="${parseInt(btn.style.borderRadius) || 6}" min="0" max="50" />
                    </div>
                `;
            },

            divider: (el) => {
                const hr = el.querySelector('hr');
                const borderStyle = hr.style.borderTop || '2px solid #e5e7eb';
                const parts = borderStyle.split(' ');
                return `
                    <div class="pb-property-group">
                        <label class="pb-property-label">Espessura (px)</label>
                        <input type="number" id="prop-height" value="${parseInt(parts[0]) || 2}" min="1" max="10" />
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Estilo</label>
                        <select id="prop-style">
                            <option value="solid" ${parts[1] === 'solid' ? 'selected' : ''}>Sólido</option>
                            <option value="dashed" ${parts[1] === 'dashed' ? 'selected' : ''}>Tracejado</option>
                            <option value="dotted" ${parts[1] === 'dotted' ? 'selected' : ''}>Pontilhado</option>
                        </select>
                    </div>
                    <div class="pb-property-group">
                        <label class="pb-property-label">Cor</label>
                        <input type="color" id="prop-color" value="${this.rgbToHex(parts[2]) || '#e5e7eb'}" />
                    </div>
                `;
            },

            spacer: (el) => {
                return `
                    <div class="pb-property-group">
                        <label class="pb-property-label">Altura (px)</label>
                        <input type="number" id="prop-height" value="${parseInt(el.querySelector('div').style.height) || 50}" min="10" max="500" />
                    </div>
                `;
            }
        };

        const formGenerator = forms[type];
        return formGenerator ? formGenerator(element) : '<p>Sem propriedades disponíveis</p>';
    }

    attachPropertyListeners(element) {
        const type = this.getElementType(element);
        const inputs = document.querySelectorAll('#propertiesContent input, #propertiesContent select, #propertiesContent textarea');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateElementProperty(element, type);
            });
        });
    }

    updateElementProperty(element, type) {
        const updates = {
            heading: (el) => {
                const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
                const text = document.getElementById('prop-text')?.value;
                const level = document.getElementById('prop-level')?.value;
                const align = document.getElementById('prop-align')?.value;
                const color = document.getElementById('prop-color')?.value;

                if (text !== undefined) heading.textContent = text;
                if (align) heading.style.textAlign = align;
                if (color) heading.style.color = color;

                if (level && heading.tagName.toLowerCase() !== level) {
                    const newHeading = document.createElement(level);
                    newHeading.textContent = heading.textContent;
                    newHeading.style.textAlign = heading.style.textAlign;
                    newHeading.style.color = heading.style.color;
                    heading.replaceWith(newHeading);
                }
            },

            text: (el) => {
                const p = el.querySelector('p');
                const text = document.getElementById('prop-text')?.value;
                const align = document.getElementById('prop-align')?.value;
                const fontSize = document.getElementById('prop-fontsize')?.value;
                const color = document.getElementById('prop-color')?.value;

                if (text !== undefined) p.textContent = text;
                if (align) p.style.textAlign = align;
                if (fontSize) p.style.fontSize = fontSize + 'px';
                if (color) p.style.color = color;
            },

            image: (el) => {
                const img = el.querySelector('img');
                const src = document.getElementById('prop-src')?.value;
                const alt = document.getElementById('prop-alt')?.value;
                const width = document.getElementById('prop-width')?.value;
                const radius = document.getElementById('prop-radius')?.value;

                if (src) img.src = src;
                if (alt !== undefined) img.alt = alt;
                if (width) img.style.width = width + '%';
                if (radius !== undefined) img.style.borderRadius = radius + 'px';
            },

            button: (el) => {
                const btn = el.querySelector('button');
                const container = el.querySelector('div');
                const text = document.getElementById('prop-text')?.value;
                const align = document.getElementById('prop-align')?.value;
                const bg = document.getElementById('prop-bg')?.value;
                const color = document.getElementById('prop-color')?.value;
                const radius = document.getElementById('prop-radius')?.value;

                if (text !== undefined) btn.textContent = text;
                if (align) container.style.textAlign = align;
                if (bg) btn.style.background = bg;
                if (color) btn.style.color = color;
                if (radius !== undefined) btn.style.borderRadius = radius + 'px';
            },

            divider: (el) => {
                const hr = el.querySelector('hr');
                const height = document.getElementById('prop-height')?.value;
                const style = document.getElementById('prop-style')?.value;
                const color = document.getElementById('prop-color')?.value;

                if (height || style || color) {
                    const h = height || '2';
                    const s = style || 'solid';
                    const c = color || '#e5e7eb';
                    hr.style.borderTop = `${h}px ${s} ${c}`;
                }
            },

            spacer: (el) => {
                const spacer = el.querySelector('div');
                const height = document.getElementById('prop-height')?.value;

                if (height) spacer.style.height = height + 'px';
            }
        };

        const updater = updates[type];
        if (updater) {
            updater(element);
            this.saveHistory();
        }
    }

    /**
     * ==========================================
     * TOOLBAR E AÇÕES
     * ==========================================
     */
    setupToolbar() {
        // Botão de fechar painel
        document.getElementById('closePanelBtn')?.addEventListener('click', () => {
            this.hideProperties();
        });

        // Botões de histórico
        document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
        document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());

        // Botão de preview
        document.getElementById('previewBtn')?.addEventListener('click', () => this.togglePreview());

        // Botão de salvar
        document.getElementById('saveBtn')?.addEventListener('click', () => this.save());

        // Botão de exportar
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportHTML());
    }

    setupDeviceSwitcher() {
        const deviceBtns = document.querySelectorAll('.pb-device-btn');

        deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                deviceBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const device = btn.dataset.device;
                this.currentDevice = device;
                this.canvas.className = `pb-canvas device-${device}`;
            });
        });
    }

    /**
     * ==========================================
     * HISTÓRICO (UNDO/REDO)
     * ==========================================
     */
    saveHistory() {
        const state = this.canvas.innerHTML;

        // Remove estados futuros se estiver no meio do histórico
        this.history = this.history.slice(0, this.historyIndex + 1);

        this.history.push(state);

        // Limita o tamanho do histórico
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.canvas.innerHTML = this.history[this.historyIndex];
            this.reattachAllEventListeners();
            this.deselectElement();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.canvas.innerHTML = this.history[this.historyIndex];
            this.reattachAllEventListeners();
            this.deselectElement();
        }
    }

    reattachAllEventListeners() {
        const elements = this.canvas.querySelectorAll('.pb-element');
        elements.forEach(el => this.reattachEventListeners(el));
    }

    /**
     * ==========================================
     * SALVAR E EXPORTAR
     * ==========================================
     */
    save() {
        const data = {
            elements: this.elements,
            html: this.canvas.innerHTML,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('pagebuilder-save', JSON.stringify(data));

        alert('Página salva com sucesso!');
    }

    load() {
        const saved = localStorage.getItem('pagebuilder-save');
        if (saved) {
            const data = JSON.parse(saved);
            this.canvas.innerHTML = data.html;
            this.reattachAllEventListeners();
            this.removeEmptyState();
        }
    }

    exportHTML() {
        const cleanHTML = this.getCleanHTML();

        const blob = new Blob([cleanHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pagina-' + Date.now() + '.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    getCleanHTML() {
        const clone = this.canvas.cloneNode(true);

        // Remove controles
        clone.querySelectorAll('.pb-element-controls').forEach(el => el.remove());

        // Remove classes de builder
        clone.querySelectorAll('.pb-element').forEach(el => {
            el.classList.remove('pb-element', 'selected', 'dragging', 'drag-over');
            el.removeAttribute('draggable');
            el.removeAttribute('id');
        });

        // Remove estado vazio
        clone.querySelectorAll('.pb-canvas-empty').forEach(el => el.remove());

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página Criada com Page Builder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    ${clone.innerHTML}
</body>
</html>`;

        return html;
    }

    togglePreview() {
        this.previewMode = !this.previewMode;
        document.body.classList.toggle('preview-mode', this.previewMode);

        if (this.previewMode) {
            this.deselectElement();
        }
    }

    /**
     * ==========================================
     * UTILITÁRIOS
     * ==========================================
     */
    removeEmptyState() {
        const emptyState = this.canvas.querySelector('.pb-canvas-empty');
        if (emptyState) {
            emptyState.remove();
        }
    }

    checkEmptyState() {
        const hasElements = this.canvas.querySelector('.pb-element');
        if (!hasElements) {
            this.canvas.innerHTML = `
                <div class="pb-canvas-empty">
                    <div class="pb-empty-state">
                        <span class="pb-empty-icon">🎨</span>
                        <h3>Comece a criar sua página</h3>
                        <p>Arraste elementos da barra lateral para começar</p>
                    </div>
                </div>
            `;
        }
    }

    rgbToHex(rgb) {
        if (!rgb || rgb.indexOf('rgb') !== 0) return rgb;

        const matches = rgb.match(/\d+/g);
        if (!matches || matches.length < 3) return rgb;

        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`;
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const pageBuilder = new PageBuilder('canvas');

    // Carregar página salva se existir
    pageBuilder.load();

    // Expor globalmente para debug
    window.pageBuilder = pageBuilder;
});
