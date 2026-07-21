<template>
  <div class="flex min-h-screen flex-col bg-[#f5f6f4]">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
