import React from "react";
import { Cloud, DownloadCloud, LogOut, RefreshCw } from "lucide-react";

/** Account & cloud sync when Supabase auth is active (user already signed in via app gate). */
export default function SupabaseCloudSyncSection({
  accountEmail,
  onSignOut,
  lastCloudSyncAt = null,
  cloudSyncStatus = "idle",
  cloudSyncMessage = "",
  onSyncNow,
  onPullFromCloud,
  cloudPushPaused = false,
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Cloud className="w-4 h-4" />
        Account &amp; cloud sync
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Signed in with Supabase. Your data stays on this device and is backed up to your private
        cloud when sync runs.
      </p>

      <div className="space-y-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
        {accountEmail && (
          <div className="text-sm">
            Signed in as <span className="font-medium">{accountEmail}</span>
          </div>
        )}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {cloudPushPaused && (
            <p className="text-amber-800 dark:text-amber-200">
              Automatic cloud upload is paused. Use <strong>Save to cloud now</strong> when ready.
            </p>
          )}
          {cloudSyncStatus === "syncing" && <p>Saving to cloud…</p>}
          {cloudSyncStatus === "ok" && lastCloudSyncAt != null && (
            <p>Last saved to cloud: {new Date(lastCloudSyncAt).toLocaleString()}</p>
          )}
          {cloudSyncStatus === "ok" && lastCloudSyncAt == null && (
            <p>Cloud backup will run shortly after you make changes.</p>
          )}
          {cloudSyncStatus === "error" && cloudSyncMessage && (
            <p className="text-red-600 dark:text-red-400">{cloudSyncMessage}</p>
          )}
        </div>
        {onSyncNow && (
          <button
            type="button"
            onClick={() => onSyncNow()}
            disabled={cloudSyncStatus === "syncing"}
            className="w-full text-left px-3 py-2 rounded-xl bg-primary-600/15 dark:bg-primary-500/20 text-sm hover:bg-primary-600/25 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cloudSyncStatus === "syncing" ? "animate-spin" : ""}`} />
            Save to cloud now
          </button>
        )}
        {onPullFromCloud && (
          <button
            type="button"
            onClick={() => onPullFromCloud()}
            disabled={cloudSyncStatus === "syncing"}
            className="w-full text-left px-3 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sm hover:bg-sky-200/80 dark:hover:bg-sky-900/50 transition-colors flex items-center gap-2 disabled:opacity-50 text-sky-950 dark:text-sky-100"
          >
            <DownloadCloud className={`w-4 h-4 ${cloudSyncStatus === "syncing" ? "animate-pulse" : ""}`} />
            Get latest from cloud
          </button>
        )}
        {onSignOut && (
          <button
            type="button"
            onClick={() => onSignOut()}
            className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
