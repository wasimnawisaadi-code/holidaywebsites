import { SinglePhoto } from "./SinglePhoto";
import { useRef } from "react";

type DriverValues = {
  driverName?: string | undefined;
  driverPhone?: string | undefined;
  vehicle?: string | undefined;
  plate?: string | undefined;
  driverPhoto?: string | undefined;
  vehiclePhoto?: string | undefined;
  driverPhotoUrl?: string | null | undefined;
  vehiclePhotoUrl?: string | null | undefined;
};

const TEXT_FIELDS = [
  ["driverName", "Driver's name", "Mr Ahmed"],
  ["driverPhone", "Driver's phone / WhatsApp", "+971 50 123 4567"],
  ["vehicle", "Vehicle", "White Toyota Land Cruiser"],
  ["plate", "Plate number", "Dubai O 12345"],
] as const;

/**
 * The transfer's own driver and car: name, number, plate, and a photo of each.
 * Inputs carry `name`s, so a <form> collects them with FormData; photo paths
 * travel in hidden inputs for the same reason.
 */
export function TransferDriverFields({
  tripId,
  values,
  set,
  onBusy,
}: {
  tripId: string;
  values: DriverValues;
  set: (patch: Partial<Record<keyof DriverValues, string | undefined>>) => void;
  onBusy?: ((busy: boolean) => void) | undefined;
}) {
  const activeUploads = useRef(0);
  const photoBusy = (busy: boolean) => {
    const previous = activeUploads.current;
    activeUploads.current = Math.max(0, previous + (busy ? 1 : -1));
    if (Boolean(previous) !== Boolean(activeUploads.current)) onBusy?.(activeUploads.current > 0);
  };
  return (
    <fieldset className="rounded-xl border border-hair bg-paper p-3 sm:col-span-2">
      <legend className="px-1 text-xs font-bold text-navy">
        Driver & vehicle for the customer
      </legend>
      <p className="mb-3 text-[11px] text-muted">
        Shown on the customer&apos;s transfer card with Call and WhatsApp buttons. Filled here,
        these replace the matching details of a driver chosen from the list.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {TEXT_FIELDS.map(([key, label, placeholder]) => (
          <label key={key} className="block text-xs font-semibold text-navy">
            {label}
            <input
              name={key}
              value={values[key] ?? ""}
              onChange={(e) => set({ [key]: e.target.value })}
              placeholder={placeholder}
              maxLength={200}
              type={key === "driverPhone" ? "tel" : "text"}
              className="mt-1.5 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm font-normal outline-none focus:border-gold"
            />
          </label>
        ))}
        <SinglePhoto
          label="Driver photo"
          folder={tripId}
          path={values.driverPhoto}
          url={values.driverPhotoUrl}
          onChange={(path) => set({ driverPhoto: path })}
          onBusy={photoBusy}
        />
        <SinglePhoto
          label="Vehicle photo"
          folder={tripId}
          path={values.vehiclePhoto}
          url={values.vehiclePhotoUrl}
          onChange={(path) => set({ vehiclePhoto: path })}
          onBusy={photoBusy}
        />
        <input type="hidden" name="driverPhoto" value={values.driverPhoto ?? ""} />
        <input type="hidden" name="vehiclePhoto" value={values.vehiclePhoto ?? ""} />
      </div>
    </fieldset>
  );
}
