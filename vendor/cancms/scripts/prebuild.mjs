// scripts/optimize-blog-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/**
 * 
 
  图片是希望和文章保持在同一个博客文件夹，一个文件夹就是一篇博客文章，这样方便博客对本篇图片的引用。 
  好像astro 对于动态加载图片很麻烦。
  能不能在build的时候用程序把博客的图片输出到public/images/blog/_resources 目录下面， 这样写[slug].astro 文件的代码时
  可以直接引用public下面的图片，不用动态Import 了？


  从 src/data/post/{slug}/ 目录读取每篇博客的图片
  将图片优化后输出到 public/images/blog/_resources/{slug}/ 目录
  在 [slug].astro 中可以直接引用 /images/blog/_resources/{slug}/图片名.webp 路径，无需动态 import

  
  把博客文章的图片生成到Public目录下，方便部署时直接引用
  博客文章路径: src/data/post/{slug}/index.mdx

 * 
 * 
 */

function generateBlogImagesToPublic() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const BLOG_CONTENT_DIR = path.join(process.cwd(), 'src/data/post');
  const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public/images/post');

  // 图片优化配置
  const IMAGE_CONFIG = {
    cover: { width: 1200, quality: 80, format: 'webp' },
    gallery: { width: 800, quality: 75, format: 'webp' },
    thumbnail: { width: 400, quality: 70, format: 'webp' },
  };

  // 确保目录存在
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  // 读取所有文章
  const posts = fs
    .readdirSync(BLOG_CONTENT_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  posts.forEach(async (postSlug) => {
    const postDir = path.join(BLOG_CONTENT_DIR, postSlug);
    const targetDir = path.join(PUBLIC_IMAGES_DIR, postSlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(postDir);
    const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

    // 直接复制图片到 public 目录（不 resize）
    imageFiles.forEach((imageFile) => {
      const srcPath = path.join(postDir, imageFile);
      const outputPath = path.join(targetDir, imageFile);
      fs.copyFileSync(srcPath, outputPath);
      // console.log(`✅ ${postSlug}/${imageFile} → ${outputPath}`);
    });

    // 复制并优化每张图片（已注释，改用直接复制）
    // await Promise.all(
    //   imageFiles.map(async (imageFile) => {
    //     const srcPath = path.join(postDir, imageFile);
    //     const baseName = path.basename(imageFile, path.extname(imageFile));
    //
    //     // 根据文件名判断用途
    //     let config = IMAGE_CONFIG.gallery;
    //     if (imageFile.includes('cover') || imageFile.includes('hero')) {
    //       config = IMAGE_CONFIG.cover;
    //     } else if (imageFile.includes('thumb')) {
    //       config = IMAGE_CONFIG.thumbnail;
    //     }
    //
    //     // 生成优化后的 WebP
    //     const outputPath = path.join(targetDir, `${baseName}.webp`);
    //     await sharp(srcPath)
    //       .resize(config.width, null, { withoutEnlargement: true })
    //       .webp({ quality: config.quality })
    //       .toFile(outputPath);
    //
    //     console.log(`✅ ${postSlug}/${imageFile} → ${outputPath}`);
    //   })
    // );
  });
}

generateBlogImagesToPublic();
