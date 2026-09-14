<script setup lang="ts">
import { useSeo } from '@/composable/useSeo';

// ✅ 使用 useSeo 统一处理 canonical、og:url、hreflang 等
useSeo({
  title: 'About - IT Tools',
});
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-600px />
</template>
