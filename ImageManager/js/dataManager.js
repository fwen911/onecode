/**
 * 数据管理器 - 负责处理图片和集合数据的存储、检索和管理
 */
class DataManager {
    constructor() {
        this.imagesKey = 'image_manager_images';
        this.collectionsKey = 'image_manager_collections';
        this.initializeStorage();
    }

    /**
     * 初始化本地存储，确保必要的数据结构存在
     */
    initializeStorage() {
        if (!localStorage.getItem(this.imagesKey)) {
            localStorage.setItem(this.imagesKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.collectionsKey)) {
            localStorage.setItem(this.collectionsKey, JSON.stringify([]));
        }
    }

    /**
     * 获取所有图片数据
     * @returns {Array} 图片数据数组
     */
    getAllImages() {
        return JSON.parse(localStorage.getItem(this.imagesKey) || '[]');
    }

    /**
     * 保存图片数据
     * @param {Array} images 图片数据数组
     */
    saveImages(images) {
        localStorage.setItem(this.imagesKey, JSON.stringify(images));
    }

    /**
     * 获取所有集合数据
     * @returns {Array} 集合数据数组
     */
    getAllCollections() {
        return JSON.parse(localStorage.getItem(this.collectionsKey) || '[]');
    }

    /**
     * 保存集合数据
     * @param {Array} collections 集合数据数组
     */
    saveCollections(collections) {
        localStorage.setItem(this.collectionsKey, JSON.stringify(collections));
    }

    /**
     * 添加新图片
     * @param {Object} imageData 图片数据对象
     * @returns {Object} 保存后的图片数据（包含ID）
     */
    addImage(imageData) {
        const images = this.getAllImages();
        const newImage = {
            id: this.generateUniqueId(),
            ...imageData,
            uploadDate: new Date().toISOString(),
            collections: imageData.collections || []
        };
        
        images.push(newImage);
        this.saveImages(images);
        return newImage;
    }

    /**
     * 更新图片数据
     * @param {String} imageId 图片ID
     * @param {Object} updatedData 更新的数据
     * @returns {Boolean} 更新是否成功
     */
    updateImage(imageId, updatedData) {
        const images = this.getAllImages();
        const imageIndex = images.findIndex(img => img.id === imageId);
        
        if (imageIndex !== -1) {
            images[imageIndex] = {
                ...images[imageIndex],
                ...updatedData
            };
            this.saveImages(images);
            return true;
        }
        return false;
    }

    /**
     * 删除图片
     * @param {String} imageId 图片ID
     * @returns {Boolean} 删除是否成功
     */
    deleteImage(imageId) {
        const images = this.getAllImages();
        const filteredImages = images.filter(img => img.id !== imageId);
        
        if (filteredImages.length !== images.length) {
            this.saveImages(filteredImages);
            // 同时从所有集合中移除该图片
            this.removeImageFromAllCollections(imageId);
            return true;
        }
        return false;
    }

    /**
     * 从所有集合中移除指定图片
     * @param {String} imageId 图片ID
     */
    removeImageFromAllCollections(imageId) {
        const collections = this.getAllCollections();
        const updatedCollections = collections.map(collection => ({
            ...collection,
            images: collection.images.filter(id => id !== imageId)
        }));
        this.saveCollections(updatedCollections);
    }

    /**
     * 添加新集合
     * @param {Object} collectionData 集合数据对象
     * @returns {Object} 保存后的集合数据（包含ID）
     */
    addCollection(collectionData) {
        const collections = this.getAllCollections();
        const newCollection = {
            id: this.generateUniqueId(),
            ...collectionData,
            createdAt: new Date().toISOString(),
            images: []
        };
        
        collections.push(newCollection);
        this.saveCollections(collections);
        return newCollection;
    }

    /**
     * 更新集合数据
     * @param {String} collectionId 集合ID
     * @param {Object} updatedData 更新的数据
     * @returns {Boolean} 更新是否成功
     */
    updateCollection(collectionId, updatedData) {
        const collections = this.getAllCollections();
        const collectionIndex = collections.findIndex(col => col.id === collectionId);
        
        if (collectionIndex !== -1) {
            collections[collectionIndex] = {
                ...collections[collectionIndex],
                ...updatedData
            };
            this.saveCollections(collections);
            return true;
        }
        return false;
    }

    /**
     * 删除集合
     * @param {String} collectionId 集合ID
     * @returns {Boolean} 删除是否成功
     */
    deleteCollection(collectionId) {
        const collections = this.getAllCollections();
        const filteredCollections = collections.filter(col => col.id !== collectionId);
        
        if (filteredCollections.length !== collections.length) {
            this.saveCollections(filteredCollections);
            // 同时从所有图片中移除该集合引用
            this.removeCollectionFromAllImages(collectionId);
            return true;
        }
        return false;
    }

    /**
     * 从所有图片中移除指定集合引用
     * @param {String} collectionId 集合ID
     */
    removeCollectionFromAllImages(collectionId) {
        const images = this.getAllImages();
        const updatedImages = images.map(image => ({
            ...image,
            collections: image.collections.filter(id => id !== collectionId)
        }));
        this.saveImages(updatedImages);
    }

    /**
     * 将图片添加到集合
     * @param {String} imageId 图片ID
     * @param {String} collectionId 集合ID
     * @returns {Boolean} 添加是否成功
     */
    addImageToCollection(imageId, collectionId) {
        // 更新图片的集合引用
        const images = this.getAllImages();
        const imageIndex = images.findIndex(img => img.id === imageId);
        
        if (imageIndex === -1) return false;
        
        if (!images[imageIndex].collections.includes(collectionId)) {
            images[imageIndex].collections.push(collectionId);
            this.saveImages(images);
        }
        
        // 更新集合的图片引用
        const collections = this.getAllCollections();
        const collectionIndex = collections.findIndex(col => col.id === collectionId);
        
        if (collectionIndex === -1) return false;
        
        if (!collections[collectionIndex].images.includes(imageId)) {
            collections[collectionIndex].images.push(imageId);
            this.saveCollections(collections);
        }
        
        return true;
    }

    /**
     * 从集合中移除图片
     * @param {String} imageId 图片ID
     * @param {String} collectionId 集合ID
     * @returns {Boolean} 移除是否成功
     */
    removeImageFromCollection(imageId, collectionId) {
        // 更新图片的集合引用
        const images = this.getAllImages();
        const imageIndex = images.findIndex(img => img.id === imageId);
        
        if (imageIndex !== -1) {
            images[imageIndex].collections = images[imageIndex].collections.filter(id => id !== collectionId);
            this.saveImages(images);
        }
        
        // 更新集合的图片引用
        const collections = this.getAllCollections();
        const collectionIndex = collections.findIndex(col => col.id === collectionId);
        
        if (collectionIndex !== -1) {
            collections[collectionIndex].images = collections[collectionIndex].images.filter(id => id !== imageId);
            this.saveCollections(collections);
            return true;
        }
        
        return false;
    }

    /**
     * 获取集合中的所有图片
     * @param {String} collectionId 集合ID
     * @returns {Array} 图片数据数组
     */
    getImagesByCollection(collectionId) {
        const collection = this.getAllCollections().find(col => col.id === collectionId);
        if (!collection) return [];
        
        const allImages = this.getAllImages();
        return allImages.filter(img => collection.images.includes(img.id));
    }

    /**
     * 搜索图片
     * @param {String} query 搜索关键词
     * @returns {Array} 匹配的图片数据数组
     */
    searchImages(query) {
        if (!query.trim()) return this.getAllImages();
        
        const lowercaseQuery = query.toLowerCase();
        return this.getAllImages().filter(img => 
            (img.name && img.name.toLowerCase().includes(lowercaseQuery)) ||
            (img.description && img.description.toLowerCase().includes(lowercaseQuery))
        );
    }

    /**
     * 排序图片
     * @param {Array} images 图片数组
     * @param {String} sortBy 排序方式 ('newest', 'oldest', 'name')
     * @returns {Array} 排序后的图片数组
     */
    sortImages(images, sortBy) {
        const sortedImages = [...images];
        
        switch (sortBy) {
            case 'newest':
                return sortedImages.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            case 'oldest':
                return sortedImages.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
            case 'name':
                return sortedImages.sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
            default:
                return sortedImages;
        }
    }

    /**
     * 根据注解内容自动分类图片
     */
    autoCategorizeByDescription() {
        // 简化版本，避免可能的语法错误
        try {
            const images = this.getAllImages();
            // 暂时不实现自动分类功能，确保基础上传功能可用
        } catch (error) {
            console.error('自动分类过程中出错:', error);
        }
    }

    /**
     * 生成唯一ID
     * @returns {String} 唯一ID
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 清除所有数据（用于调试）
     */
    clearAllData() {
        localStorage.removeItem(this.imagesKey);
        localStorage.removeItem(this.collectionsKey);
        this.initializeStorage();
    }
}

// 导出单例实例
const dataManager = new DataManager();
export default dataManager;