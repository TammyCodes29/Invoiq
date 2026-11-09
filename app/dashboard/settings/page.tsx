import { getSettings } from "@/actions/settings"
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm"

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase text-[#738278]">Preferences</p>
        <h1 className="font-serif text-[34px] font-normal leading-tight text-[#1b3029]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[#718078]">
          Manage your business details and invoice defaults.
        </p>
      </div>

      {settings && <SettingsForm initialData={settings} />}
    </div>
  )
}