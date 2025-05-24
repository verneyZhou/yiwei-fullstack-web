const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');
const { v4: uuidv4 } = require('uuid');
const { OSS_CONFIG } = require('../config');

class UploadService {
    constructor() {
        // 初始化 OSS 客户端
        this.client = new OSS({
            region: OSS_CONFIG.region,
            accessKeyId: OSS_CONFIG.accessKeyId,
            accessKeySecret: OSS_CONFIG.accessKeySecret,
            bucket: OSS_CONFIG.bucket,
            authorizationV4: true, // 使用V4签名算法（推荐）
            endpoint: 'static.verneyzhou-code.cn',
            // secure: true, // 使用HTTPS，需要
            cname: true, // 使用自定义域名
        });
    }

    async handleFileUpload(ctx) {
        const file = ctx.request.files.file;
        console.log('ctx.request.files', ctx.request.files);
        if (!file) throw new Error('No file uploaded');

        // 允许的文件类型
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/svg+xml',
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('File type not allowed');
        }

        // 自定义请求头
        const headers = {
            // 指定Object的存储类型。
            'x-oss-storage-class': 'Standard',
            // 指定Object的访问权限。
            // 'x-oss-object-acl': 'private',
            // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.txt。
            // 'Content-Disposition': 'attachment; filename="example.txt"',
            // 设置Object的标签，可同时设置多个标签。
            'x-oss-tagging': 'Tag1=1&Tag2=2',
            // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
            'x-oss-forbid-overwrite': 'true',
        };

        try {
            // 获取文件扩展名
            const ext = path.extname(file.originalFilename);
            // 生成 OSS 存储路径，按年月日进行分类
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            // 生成唯一文件名
            const fileName = `${year}/${month}/${day}/${uuidv4()}${ext}`;

            // 上传文件到 OSS
            const result = await this.client.put(fileName, file.filepath, {
                headers,
            });
            // 生成访问链接
            const url = result.url; // OSS 返回的文件访问地址

            return {
                url,
                originalName: file.originalFilename,
                size: file.size,
                type: file.mimetype,
            };
        } catch (error) {
            console.error('Upload to OSS failed:', error);
            throw new Error(`File upload failed: ${error}`);
        } finally {
            // 清理临时文件
            fs.unlink(file.filepath, (err) => {
                if (err) console.error('Failed to remove temp file:', err);
            });
        }
    }
    async handleFileUploadLocal(ctx) {
        console.log('ctx.request.files', ctx.request.files);
        const file = ctx.request.files.file;
        if (!file) throw new Error('No file uploaded');

        // 允许的文件类型
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('File type not allowed');
        }

        // 获取文件扩展名
        const ext = path.extname(file.originalFilename);
        // 生成唯一文件名
        const fileName = `${uuidv4()}${ext}`;

        // 确保上传目录存在
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 读取上传的文件
        const reader = fs.createReadStream(file.filepath);
        // 创建写入流
        const filePath = path.join(uploadDir, fileName);
        const writer = fs.createWriteStream(filePath);

        reader.pipe(writer); // 将读取流写入到写入流

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // 这里返回文件的URL
                // 实际项目中，你需要将文件上传到CDN并返回CDN链接
                // 这里简单返回本地访问路径作为示例
                const fileUrl = `http://localhost:9527/public/uploads/${fileName}`;
                resolve({
                    url: fileUrl,
                    originalName: file.originalFilename,
                    size: file.size,
                    type: file.mimetype,
                });
            });
            writer.on('error', reject);
        });
    }
}

module.exports = new UploadService();

/**
 * 实际生产环境中，你需要：
- 将文件上传到云存储（如阿里云OSS、腾讯云COS等）
- 添加文件大小限制
- 增加文件类型校验
- 实现文件秒传
- 支持断点续传
- 添加上传进度监控
- 实现防盗链等安全措施
 */
