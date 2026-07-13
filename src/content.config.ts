import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});


// 以一个文件夹为一篇博客
const postFolderCollection = defineCollection({
  loader: glob({
    // 递归匹配所有子文件夹里的 index.md / index.mdx
    pattern: '**/index.{md,mdx}',
    base: 'src/data/post',
    // 可选：自定义 slug，让路径干净 article1 而非 article1/index
    generateId: ({ entry }) => {
      // entry = "article1/index.md"
      return entry.replace(/\/index\.(md|mdx)$/, '');
    },
  }),
  // schema 接收 image 工具，新增 images 图片数组，废弃旧单 image 字段
  schema: ({ image }) => z.object({
    publishDate: z.coerce.date().optional(),
    updateDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),

    title: z.string(),
    excerpt: z.string().optional(),

    coverImage: z.string().optional(),
    // 替换原来单 image 字段，改为图片数组（本地资源，自动优化）
    // images: z.array(image()).default([]),
    // 数组内是对象，包含 src（图片资源）+ alt（文本）
    images: z.array(
      z.object({
        file: image(),
        alt: z.string().optional(),
      })
    ).default([]),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});




const spaCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/data/spa' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    district: z.enum(['澳门半岛', '氹仔']),
    priceMin: z.number(),
    priceMax: z.number(),
    rating: z.number(),
    overnightAllowed: z.boolean(),
    freeOvernightRoom: z.boolean(),
    open24h: z.boolean(),
    website: z.string().optional(),
    ktv: z.boolean(),
    themeRooms: z.boolean(),
    recommendedShow: z.boolean(),
    isNew: z.boolean(),
    buckets: z.array(z.string()),
    features: z.array(z.string()),
    staffCount: z.string().optional(),
    staffNationalities: z.string().optional(),
    openingHours: z.string().optional(),
    staffHours: z.string().optional(),
    address: z.string().optional(),
    cover: z.string(),
    images: z.array(z.object({ id: z.number(), url: z.string(), caption: z.string(), alt: z.string() })),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }).catchall(z.unknown()), // MD 文件加任何字段都不会报错
});


export const collections = {
  // post: postCollection,
  post: postFolderCollection, // 以文件夹为单位的博客集合
  spa: spaCollection,
};
