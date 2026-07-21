<script setup lang="ts">
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'

await navigateTo(TRANSPORT_ROUTES.ROOT, { redirectCode: 301 })
</script>
