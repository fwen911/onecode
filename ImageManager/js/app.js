/**
 * 图片管理器主应用文件
 * 负责初始化应用并连接各个模块
 */

// 导入模块
import dataManager from './dataManager.js';
import UIManager from './uiManager.js';

/**
 * 主应用类
 */
class ImageManagerApp {
    constructor() {
        this.dataManager = dataManager;
        this.uiManager = null;
    }

    /**
     * 初始化应用
     */
    initialize() {
        // 等待DOM加载完成
        document.addEventListener('DOMContentLoaded', () => {
            // 初始化UI管理器
            this.uiManager = new UIManager(this.dataManager);
            
            // 初始化界面
            this.uiManager.initializeUI();
            
            // 添加一些示例数据（可选）
            this.addSampleDataIfEmpty();
            
            // 注册一些全局错误处理
            this.setupErrorHandling();
        });
    }

    /**
     * 如果没有数据，添加一些示例数据
     */
    addSampleDataIfEmpty() {
        const images = this.dataManager.getAllImages();
        const collections = this.dataManager.getAllCollections();
        
        // 如果已经有数据，不添加示例数据
        if (images.length > 0 || collections.length > 0) {
            return;
        }
        
        // 添加示例集合
        const travelCollection = this.dataManager.addCollection({
            name: '旅行照片',
            description: '记录美好旅程的照片'
        });
        
        const familyCollection = this.dataManager.addCollection({
            name: '家庭相册',
            description: '家庭聚会和重要时刻'
        });
        
        // 由于我们不能实际访问图片文件，这里使用占位图服务
        // 在实际使用时，用户会上传自己的图片
        const sampleImages = [
            {
                name: '山水风景',
                description: '美丽的山水风景照，拍摄于山间',
                url: 'https://via.placeholder.com/600x400/3498db/ffffff?text=山水风景'
            },
            {
                name: '海滩日落',
                description: '夕阳西下的海滩美景，金色的阳光洒在海面上',
                url: 'https://via.placeholder.com/600x400/e74c3c/ffffff?text=海滩日落'
            },
            {
                name: '城市夜景',
                description: '繁华都市的夜景，灯火辉煌',
                url: 'https://via.placeholder.com/600x400/2ecc71/ffffff?text=城市夜景'
            },
            {
                name: '家庭聚餐',
                description: '温馨的家庭聚餐时光，充满欢声笑语',
                url: 'https://via.placeholder.com/600x400/f39c12/ffffff?text=家庭聚餐'
            }
        ];
        
        // 添加示例图片
        sampleImages.forEach((imageData, index) => {
            const savedImage = this.dataManager.addImage(imageData);
            
            // 将图片添加到相应的集合
            if (index < 2) {
                this.dataManager.addImageToCollection(savedImage.id, travelCollection.id);
            }
            if (index === 3) {
                this.dataManager.addImageToCollection(savedImage.id, familyCollection.id);
            }
        });
        
        // 重新渲染界面以显示示例数据
        this.uiManager.renderImageGallery();
        this.uiManager.renderCollections();
    }

    /**
     * 设置全局错误处理
     */
    setupErrorHandling() {
        // 捕获未处理的Promise错误
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise错误:', event.reason);
            if (this.uiManager) {
                this.uiManager.showNotification('发生未知错误，请刷新页面重试', 'error');
            }
        });
        
        // 捕获全局错误
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            if (this.uiManager) {
                this.uiManager.showNotification('应用发生错误，请刷新页面重试', 'error');
            }
        });
    }
}

// 创建并初始化应用
const app = new ImageManagerApp();
app.initialize();

// 导出应用实例（可选，用于调试）
window.app = app;