// src/navigation.ts
// ⚠️ 这个文件只导出数据，不执行任何函数调用

export interface NavLink {
  key: string;        // 翻译键，如 'nav.spa'
  href: string;       // 路径，如 '/#spa'
}

export interface FooterLink {
  title?: string;
  links?: Array<{ text: string; href: string }>;
}

export const headerLinks: NavLink[] = [
  { key: 'nav.spa', href: '/#spas' },
  { key: 'nav.ranking', href: '/ranking' },
  { key: 'nav.guide', href: '/guide' },
  { key: 'nav.faq', href: '/faq' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.blog', href: '/blog' },
];

export const actions = [
  { text: 'Download', href: 'https://github.com/arthelokyo/astrowind', target: '_blank' },
];

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'Features', href: '#' },
        { text: 'Security', href: '#' },
        { text: 'Team', href: '#' },
        { text: 'Enterprise', href: '#' },
        { text: 'Customer stories', href: '#' },
        { text: 'Pricing', href: '#' },
        { text: 'Resources', href: '#' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { text: 'Developer API', href: '#' },
        { text: 'Partners', href: '#' },
        { text: 'Atom', href: '#' },
        { text: 'Electron', href: '#' },
        { text: 'AstroWind Desktop', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Docs', href: '#' },
        { text: 'Community Forum', href: '#' },
        { text: 'Professional Services', href: '#' },
        { text: 'Skills', href: '#' },
        { text: 'Status', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: '#' },
        { text: 'Blog', href: '#' },
        { text: 'Careers', href: '#' },
        { text: 'Press', href: '#' },
        { text: 'Inclusion', href: '#' },
        { text: 'Social Impact', href: '#' },
        { text: 'Shop', href: '#' },
      ],
    },
  ],
  secondaryLinks: [
    // { text: 'Terms', href: '/terms' },
    // { text: 'Privacy Policy', href: '/privacy' },
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/arthelokyo/astrowind' },
  ],
  footNote: `
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://github.com/arthelokyo"> Arthelokyo</a> · All rights reserved.
  `,
};

// 为了兼容旧代码，保留 headerData 别名
export const headerData = {
  links: headerLinks,
  actions: actions,
};
