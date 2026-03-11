import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/griflan')({
  component: GriflanPage,
})

function GriflanPage() {
  return null
}
