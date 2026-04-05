import React from "react";
import { X, Cloud, HardDrive, Clock } from "lucide-react";
import { formatCloudUpdatedAt } from "@/cloudFirestoreSync";

/**
 * First-time choice when cloud already has campaign data and user signs in on this device.
 */
export default function CloudMergeModal({
  open,
  remoteData,
  onUseCloud,
  onKeepDevice,
  onDecideLater,
}) {
  if (!open || !remoteData) return null;

  const when = formatCloudUpdatedAt(remoteData);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold pr-6">Cloud backup found</h3>
          <button
            type="button"
            onClick={onDecideLater}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your account already has data saved in the cloud
          {when ? (
            <>
              {" "}
              (last saved: <strong>{when}</strong>)
            </>
          ) : null}
          . This device also has its own copy. Choose which copy to use on this device. Nothing is deleted from the other place until you overwrite from one side.
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={onUseCloud}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors text-left"
          >
            <Cloud className="w-4 h-4 shrink-0" />
            <span>Use cloud data on this device (replace local copy)</span>
          </button>
          <button
            type="button"
            onClick={onKeepDevice}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <HardDrive className="w-4 h-4 shrink-0" />
            <span>Keep this device and upload it to the cloud (overwrite cloud)</span>
          </button>
          <button
            type="button"
            onClick={onDecideLater}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Clock className="w-4 h-4 shrink-0" />
            Decide later (stay on local data for now)
          </button>
        </div>
      </div>
    </div>
  );
}
