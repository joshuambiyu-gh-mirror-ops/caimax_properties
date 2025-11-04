import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/90 p-4 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-gray-700" />
        <span className="text-gray-700 text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}