import { OSProvider } from "@/lib/os-context"
import { Shell } from "@/components/shell"

export default function Page() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  )
}
