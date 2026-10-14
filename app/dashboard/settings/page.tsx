import { getSettings } from "@/actions/settings"
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm"

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your business details and invoice defaults.
        </p>
      </div>

      {settings && <SettingsForm initialData={settings} />}
    </div>
  )
}