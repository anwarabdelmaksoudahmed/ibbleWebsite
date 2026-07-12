<script setup lang="ts">
const { isSwitchingLocale } = useLocaleSwitch()
</script>

<template>
  <Teleport to="body">
    <div
      class="locale-progress"
      :class="{ 'is-active': isSwitchingLocale }"
      aria-hidden="true"
    >
      <span class="locale-progress__bar" />
    </div>
  </Teleport>
</template>
