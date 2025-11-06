/**
 * UI管理器 - 负责处理界面交互和渲染
 */
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentImage = null;
        this.currentSort = 'newest';
        this.currentSearchQuery = '';
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 主要容器
        this.imageGrid = document.getElementById('image-grid');
        this.collectionsGrid = document.getElementById('collections-grid');
        
        // 上传相关
        this.dropArea = document.getElementById('drop-area');
        this.fileInput = document.getElementById('file-input');
        this.uploadBtn = document.getElementById('upload-btn');
        
        // 搜索和排序
        this.searchInput = document.getElementById('search-input');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.sortSelect = document.getElementById('sort-select');
        
        // 模态框
        this.imageModal = document.getElementById('image-modal');
        this.collectionModal = document.getElementById('collection-modal');
        this.modalImage = document.getElementById('modal-image');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.modalDate = document.getElementById('modal-date');
        this.collectionSelector = document.getElementById('collection-selector');
        this.saveChangesBtn = document.getElementById('save-changes');
        this.deleteImageBtn = document.getElementById('delete-image');
        
        // 集合模态框
        this.collectionNameInput = document.getElementById('collection-name');
        this.collectionDescInput = document.getElementById('collection-desc');
        this.confirmCollectionBtn = document.getElementById('confirm-collection');
        this.cancelCollectionBtn = document.getElementById('cancel-collection');
        this.createCollectionBtn = document.getElementById('create-collection');
        
        // 导航
        this.navLinks = document.querySelectorAll('nav a');
        
        // 通知
        this.notification = document.getElementById('notification');
        
        // 关闭模态框按钮
        this.closeModalButtons = document.querySelectorAll('.close-modal');
    }

    /**
     * 绑定所有事件监听器
     */
    bindEvents() {
        // 上传相关事件
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传事件
        this.dropArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 搜索和排序事件
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        this.sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
        
        // 模态框事件
        this.saveChangesBtn.addEventListener('click', () => this.saveImageChanges());
        this.deleteImageBtn.addEventListener('click', () => this.confirmDeleteImage());
        
        // 集合模态框事件
        this.createCollectionBtn.addEventListener('click', () => this.openCollectionModal());
        this.confirmCollectionBtn.addEventListener('click', () => this.createCollection());
        this.cancelCollectionBtn.addEventListener('click', () => this.closeCollectionModal());
        
        // 关闭模态框事件
        this.closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // 导航链接事件
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
    }

    /**
     * 初始化界面
     */
    initializeUI() {
        this.renderImageGallery();
        this.renderCollections();
        
        // 自动分类功能（可以在初始化时运行）
        this.dataManager.autoCategorizeByDescription();
    }

    /**
     * 渲染图片库
     */
    renderImageGallery() {
        let images = this.dataManager.getAllImages();
        
        // 应用搜索过滤
        if (this.currentSearchQuery) {
            images = this.dataManager.searchImages(this.currentSearchQuery);
        }
        
        // 应用排序
        images = this.dataManager.sortImages(images, this.currentSort);
        
        // 清空图片网格
        this.imageGrid.innerHTML = '';
        
        if (images.length === 0) {
            this.imageGrid.innerHTML = `
                <div class="no-images">
                    <p>${this.currentSearchQuery ? '没有找到匹配的图片' : '暂无图片，请上传'}</p>
                </div>
            `;
            return;
        }
        
        // 创建图片卡片
        images.forEach(image => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card fade-in';
            
            const date = new Date(image.uploadDate);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            imageCard.innerHTML = `
                <img src="${image.url}" alt="${image.name || '图片'}">
                <div class="image-info">
                    <h3>${image.name || '未命名图片'}</h3>
                    <div class="image-meta">
                        <span>${formattedDate}</span>
                        <span>${image.collections.length} 个集合</span>
                    </div>
                </div>
                <div class="image-actions">
                    <button class="edit-btn" title="编辑">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            // 添加点击事件
            imageCard.addEventListener('click', (e) => {
                if (!e.target.closest('.image-actions')) {
                    this.openImageModal(image);
                }
            });
            
            // 编辑按钮事件
            const editBtn = imageCard.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openImageModal(image);
            });
            
            this.imageGrid.appendChild(imageCard);
        });
    }

    /**
     * 渲染图片集合
     */
    renderCollections() {
        const collections = this.dataManager.getAllCollections();
        
        // 清空集合网格
        this.collectionsGrid.innerHTML = '';
        
        if (collections.length === 0) {
            this.collectionsGrid.innerHTML = `
                <div class="no-collections">
                    <p>暂无图片集，点击上方按钮创建</p>
                </div>
            `;
            return;
        }
        
        // 创建集合卡片
        collections.forEach(collection => {
            const collectionCard = document.createElement('div');
            collectionCard.className = 'collection-card fade-in';
            
            // 获取集合中的第一张图片作为封面
            const firstImage = this.getFirstImageInCollection(collection.id);
            const coverImage = firstImage ? firstImage.url : '';
            
            collectionCard.innerHTML = `
                <div class="collection-cover">
                    ${coverImage ? `<img src="${coverImage}" alt="${collection.name}">` : 
                    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>`}
                </div>
                <div class="collection-info">
                    <h3>${collection.name}</h3>
                    <p>${collection.description || ''}</p>
                    <div class="collection-count">${collection.images.length} 张图片</div>
                </div>
            `;
            
            // 添加点击事件 - 打开集合详情
            collectionCard.addEventListener('click', () => {
                this.showCollectionDetails(collection);
            });
            
            this.collectionsGrid.appendChild(collectionCard);
        });
    }

    /**
     * 获取集合中的第一张图片
     */
    getFirstImageInCollection(collectionId) {
        const images = this.dataManager.getImagesByCollection(collectionId);
        return images[0] || null;
    }

    /**
     * 处理文件选择
     */
    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.uploadImages(files);
        }
    }

    /**
     * 处理拖拽悬停
     */
    handleDragOver(event) {
        event.preventDefault();
        this.dropArea.classList.add('active');
    }

    /**
     * 处理拖拽离开
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.dropArea.classList.remove('active');
    }

    /**
     * 处理文件拖拽放下
     */
    handleDrop(event) {
        event.preventDefault();
        this.dropArea.classList.remove('active');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.uploadImages(files);
        }
    }

    /**
     * 上传图片
     */
    uploadImages(files) {
        if (!files || files.length === 0) return;
        
        let uploadedCount = 0;
        const totalFiles = files.length;
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const imageData = {
                            name: this.extractFileName(file.name),
                            url: e.target.result,
                            description: '',
                            fileSize: file.size,
                            fileType: file.type,
                            collections: []
                        };
                        
                        const savedImage = this.dataManager.addImage(imageData);
                        uploadedCount++;
                        this.showNotification(`图片 "${savedImage.name}" 上传成功`, 'success');
                        this.renderImageGallery();
                        
                        // 当所有图片上传完成后再执行自动分类
                        if (uploadedCount === totalFiles) {
                            try {
                                this.dataManager.autoCategorizeByDescription();
                                this.renderCollections();
                            } catch (error) {
                                console.error('自动分类时出错:', error);
                            }
                        }
                    } catch (error) {
                        console.error('保存图片时出错:', error);
                        this.showNotification('保存图片时出错，请重试', 'error');
                    }
                };
                
                reader.onerror = () => {
                    console.error('文件读取错误:', file.name);
                    this.showNotification(`读取文件 "${file.name}" 时出错`, 'error');
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    /**
     * 提取文件名（不包含扩展名）
     */
    extractFileName(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    }

    /**
     * 处理搜索
     */
    handleSearch(event) {
        this.currentSearchQuery = event.target.value;
        this.renderImageGallery();
    }

    /**
     * 清除搜索
     */
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearchQuery = '';
        this.renderImageGallery();
    }

    /**
     * 处理排序变化
     */
    handleSortChange(event) {
        this.currentSort = event.target.value;
        this.renderImageGallery();
    }

    /**
     * 打开图片详情模态框
     */
    openImageModal(image) {
        this.currentImage = image;
        
        this.modalImage.src = image.url;
        this.modalImage.alt = image.name || '图片预览';
        this.modalTitle.textContent = image.name || '未命名图片';
        this.modalDescription.value = image.description || '';
        
        // 设置日期
        const date = image.date || image.uploadDate;
        if (date) {
            const dateObj = new Date(date);
            // 转换为 datetime-local 格式 (YYYY-MM-DDTHH:MM)
            const formattedDate = dateObj.getFullYear() + 
                '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + 
                '-' + String(dateObj.getDate()).padStart(2, '0') + 
                'T' + String(dateObj.getHours()).padStart(2, '0') + 
                ':' + String(dateObj.getMinutes()).padStart(2, '0');
            this.modalDate.value = formattedDate;
        }
        
        // 渲染集合选择器
        this.renderCollectionSelector(image.collections);
        
        this.imageModal.style.display = 'block';
    }

    /**
     * 渲染集合选择器
     */
    renderCollectionSelector(selectedCollectionIds) {
        const collections = this.dataManager.getAllCollections();
        this.collectionSelector.innerHTML = '';
        
        if (collections.length === 0) {
            this.collectionSelector.innerHTML = '<p>暂无可用的图片集</p>';
            return;
        }
        
        collections.forEach(collection => {
            const isSelected = selectedCollectionIds.includes(collection.id);
            const collectionTag = document.createElement('div');
            collectionTag.className = `collection-tag ${isSelected ? 'selected' : ''}`;
            collectionTag.textContent = collection.name;
            collectionTag.dataset.id = collection.id;
            
            // 添加点击事件切换选择状态
            collectionTag.addEventListener('click', () => {
                collectionTag.classList.toggle('selected');
            });
            
            this.collectionSelector.appendChild(collectionTag);
        });
    }

    /**
     * 保存图片更改
     */
    saveImageChanges() {
        if (!this.currentImage) return;
        
        // 获取更新的数据
        const updatedData = {
            description: this.modalDescription.value,
            date: this.modalDate.value ? new Date(this.modalDate.value).toISOString() : null
        };
        
        // 更新图片数据
        const success = this.dataManager.updateImage(this.currentImage.id, updatedData);
        
        // 处理集合选择
        const selectedCollectionTags = this.collectionSelector.querySelectorAll('.collection-tag.selected');
        const selectedCollectionIds = Array.from(selectedCollectionTags).map(tag => tag.dataset.id);
        
        // 获取原有的集合ID
        const originalCollectionIds = [...this.currentImage.collections];
        
        // 添加到新选择的集合
        selectedCollectionIds.forEach(collectionId => {
            if (!originalCollectionIds.includes(collectionId)) {
                this.dataManager.addImageToCollection(this.currentImage.id, collectionId);
            }
        });
        
        // 从取消选择的集合中移除
        originalCollectionIds.forEach(collectionId => {
            if (!selectedCollectionIds.includes(collectionId)) {
                this.dataManager.removeImageFromCollection(this.currentImage.id, collectionId);
            }
        });
        
        if (success) {
            this.showNotification('图片信息已更新', 'success');
            this.closeImageModal();
            this.renderImageGallery();
            this.renderCollections();
        } else {
            this.showNotification('更新失败，请重试', 'error');
        }
    }

    /**
     * 确认删除图片
     */
    confirmDeleteImage() {
        if (confirm('确定要删除这张图片吗？此操作无法撤销。')) {
            this.deleteImage();
        }
    }

    /**
     * 删除图片
     */
    deleteImage() {
        if (!this.currentImage) return;
        
        const success = this.dataManager.deleteImage(this.currentImage.id);
        
        if (success) {
            this.showNotification('图片已删除', 'info');
            this.closeImageModal();
            this.renderImageGallery();
            this.renderCollections();
        } else {
            this.showNotification('删除失败，请重试', 'error');
        }
    }

    /**
     * 打开创建集合模态框
     */
    openCollectionModal() {
        this.collectionNameInput.value = '';
        this.collectionDescInput.value = '';
        this.collectionModal.style.display = 'block';
    }

    /**
     * 创建新集合
     */
    createCollection() {
        const name = this.collectionNameInput.value.trim();
        
        if (!name) {
            this.showNotification('请输入集合名称', 'error');
            return;
        }
        
        const collectionData = {
            name: name,
            description: this.collectionDescInput.value.trim()
        };
        
        this.dataManager.addCollection(collectionData);
        this.showNotification('图片集创建成功', 'success');
        this.closeCollectionModal();
        this.renderCollections();
    }

    /**
     * 关闭集合模态框
     */
    closeCollectionModal() {
        this.collectionModal.style.display = 'none';
    }

    /**
     * 关闭图片模态框
     */
    closeImageModal() {
        this.imageModal.style.display = 'none';
        this.currentImage = null;
    }

    /**
     * 关闭所有模态框
     */
    closeAllModals() {
        this.closeImageModal();
        this.closeCollectionModal();
    }

    /**
     * 处理模态框外部点击
     */
    handleOutsideClick(event) {
        if (event.target === this.imageModal || event.target === this.collectionModal) {
            this.closeAllModals();
        }
    }

    /**
     * 处理导航点击
     */
    handleNavClick(event) {
        event.preventDefault();
        
        // 更新活动链接
        this.navLinks.forEach(link => link.classList.remove('active'));
        event.target.classList.add('active');
        
        // 滚动到对应部分
        const targetId = event.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    }

    /**
     * 显示集合详情
     */
    showCollectionDetails(collection) {
        // 在实际应用中，这里可以实现集合详情页面的跳转或显示
        // 目前简单显示一个通知
        this.showNotification(`查看集合: ${collection.name}`, 'info');
        
        // 可以扩展为显示集合中的所有图片
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

export default UIManager;