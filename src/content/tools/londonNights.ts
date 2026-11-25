/**
 * Interface text for the London 90-night counter. The limit, warning point
 * and long-stay length are stored figures, not typed here.
 */
export { storageKey, toolPath, toolSlug } from "./londonNightsId";

export const copy = {
  quickCheck: {
    title: "Quick check",
    wholeHome: "Do you let the whole home (not a room while you’re there)?",
    wholeHomeNo:
      "The 90-night limit is about letting a whole home. Letting a room while you live there usually isn’t covered. You can still use the counter to track nights.",
    councilTax: "Does the person providing the stays pay council tax on the property?",
    councilTaxNo:
      "The 90-night exemption only applies when the provider pays council tax. Without it, short lets may need planning permission from the first night. Check with your borough.",
  },
  property: "Property",
  year: "Year",
  addProperty: "Add another property",
  rename: "Rename",
  deleteProperty: "Delete",
  form: {
    addTitle: "Add a booking",
    editTitle: "Edit booking",
    checkIn: "Check-in date",
    checkOut: "Check-out date",
    nights: "Nights",
    nightsHint: "Fills itself. Type nights to set the check-out date.",
    platform: "Where was it booked?",
    otherName: "Platform name",
    reference: "Reference or guest name (optional)",
    referenceHint: "Kept on this device only.",
    note: "Note (optional)",
    add: "Add booking",
    save: "Save changes",
    cancel: "Cancel",
    duplicate: "This looks like a booking you’ve already added.",
    addAnyway: "Add it anyway",
  },
  list: {
    title: "Your bookings",
    all: "All",
    empty: "No bookings yet for this property. Add each stay from Airbnb, Booking.com, Vrbo, direct bookings and anywhere else, or import a file.",
    tryExample: "Try an example",
    exampleBanner: "You’re looking at example data, not your bookings.",
    clearExample: "Clear example",
    edit: "Edit",
    delete: "Delete",
    undo: "Undo",
    longStay: "Long stay: not counted",
    outsideYearHint: "Switch year to see these nights.",
  },
  result: {
    title: "Your count",
    usedSoFar: "Used so far",
    bookedAhead: "Booked ahead",
    show: "Show",
    copy: "Copy summary",
    copied: "Summary copied",
  },
  files: {
    title: "Import and save",
    import: "Import bookings (CSV or calendar file)",
    importHint: "CSV columns: check-in, check-out, platform, reference. Calendar files (.ics) from Airbnb, Booking.com or Vrbo work too.",
    downloadCsv: "Download CSV",
    backup: "Back up my data",
    restore: "Restore from backup",
    backupHint: "Your bookings live only on this device. A backup file keeps a copy, including any guest names, so store it safely.",
    clearAll: "Clear all my data",
    clearConfirm: "Delete every property and booking from this device? This can’t be undone unless you have a backup.",
    clearYes: "Yes, delete everything",
    storageFailed: "Your bookings couldn’t be saved on this device. Download a backup to keep them.",
  },
  privacy: "Your bookings stay on this device. Nothing is sent to us.",
  disclaimer: "General information, not legal advice. Check with your borough’s planning team if you’re unsure.",
};
