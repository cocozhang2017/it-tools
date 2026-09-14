import { computed, unref } from 'vue';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';
import { useRoute } from 'vue-router';
import type { MaybeRef } from '@vueuse/core';

const SITE_URL = import.meta.env.SITE_URL ?? 'https://it-tools.tech';
const SITE_NAME = 'IT Tools';
const DEFAULT_DESCRIPTION =
  'Collection of handy online tools for developers, with great UX. IT Tools is a free and open-source collection of handy online tools for developers & people working in IT.';

// 支持的语言列表（用于 hreflang）
const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es', 'no', 'pt', 'uk', 'vi', 'zh'];

interface UseSeoOptions {
  title?: MaybeRef<string>;
  description?: MaybeRef<string>;
  keywords?: MaybeRef<string[]>;
  image?: MaybeRef<string>;
}

/**
 * 统一处理 SEO 标签（canonical、og:url、hreflang 等）
 * 每个页面应该使用 self-referencing canonical（指向自己）
 */
export function useSeo(options: UseSeoOptions = {}) {
  const route = useRoute();
  const { locale } = useI18n();

  // 当前页面的完整 URL（self-referencing canonical）
  const currentUrl = computed(() => {
    const path = route.path === '/' ? '' : route.path;
    return `${SITE_URL}${path}`;
  });

  const head = computed<HeadObject>(() => {
    const title =
      unref(options.title) ??
      (route.meta.name ? `${route.meta.name} - ${SITE_NAME}` : `${SITE_NAME} - Handy online tools for developers`);
    const description =
      unref(options.description) ??
      (route.meta.description as string) ??
      DEFAULT_DESCRIPTION;
    const keywords =
      (unref(options.keywords) ?? [])
        .concat((route.meta.keywords as string[]) ?? [])
        .filter(Boolean);

    // 构建 hreflang alternates
    const alternates: HeadObject['link'] = [
      // 每个语言版本
      ...SUPPORTED_LOCALES.map((lang) => {
        const path = route.path === '/' ? '' : route.path;
        return {
          rel: 'alternate',
          hreflang: lang,
          href: `${SITE_URL}${path}?lang=${lang}`,
        };
      }),
      // x-default 指向英文版
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
      },
    ];

    return {
      title,
      htmlAttrs: {
        lang: locale.value,
      },
      link: [
        // self-referencing canonical
        {
          rel: 'canonical',
          href: currentUrl.value,
        },
        ...alternates,
      ],
      meta: [
        {
          name: 'description',
          content: description,
        },
        {
          name: 'keywords',
          content: keywords.join(','),
        },
        // Open Graph
        {
          property: 'og:url',
          content: currentUrl.value,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:locale',
          content: locale.value,
        },
        // Twitter
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
      ],
    };
  });

  useHead(head);

  return {
    currentUrl,
    siteUrl: SITE_URL,
  };
}
