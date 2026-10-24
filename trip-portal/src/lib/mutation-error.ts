/** Return safe, actionable errors; never expose database responses to the browser. */
export function mutationError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "Not signed in.")
    return "Your sign-in expired. Sign in in another tab, then retry here. Your details are still here.";
  if (
    [
      "Add a title",
      "Add the guide's name",
      "Invalid activity",
      "Invalid driver",
      "Driver not found",
      "Day not found in this trip",
    ].includes(message)
  )
    return message === "Invalid activity"
      ? "Check the activity details and text lengths, then retry."
      : message;
  return fallback;
}
