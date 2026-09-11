import React from "react";
import { HardDrive, RefreshCw, LogOut, X } from "lucide-react";

/** Device has local street data but user signed into a different account (no cloud merge yet). */
export default function AccountSwitchModal({
  open,
  userEmail,
  onUseLocalForAccount,
  onStartFresh,
  onSignOut,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold pr-6">Different account on this device</h3>
          <button
            type="button"
            onClick={onSignOut}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You signed in as <strong>{userEmail || "this account"}</strong>, but this device still has
          street data from a previous login and this account has no cloud backup yet. Choose what to
          do before anything uploads to the cloud.
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={onUseLocalForAccount}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors text-left"
          >
            <HardDrive className="w-4 h-4 shrink-0" />
            <span>Use this device data for this account (upload to this account&apos;s cloud)</span>
          </button>
          <button
            type="button"
            onClick={onStartFresh}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>Start fresh for this account (clear local street data on this device)</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
