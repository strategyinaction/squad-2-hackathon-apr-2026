import { signOutUser } from '#/lib/firebase'
import { Logout } from '#/icons'

export function LogoutButton() {
  return (
    <div className="relative group shrink-0">
      <button
        onClick={() => signOutUser()}
        className="flex items-center justify-center h-8 w-8 rounded-lg border transition-colors border-border bg-white text-muted-foreground hover:bg-shell hover:text-foreground"
      >
        <Logout className="w-4 h-4" />
      </button>
      <span className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-heading px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-small transition-opacity group-hover:opacity-100">
        Logout
      </span>
    </div>
  )
}
