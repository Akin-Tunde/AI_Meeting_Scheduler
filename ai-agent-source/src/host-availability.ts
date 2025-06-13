export function getMockAvailability(date?: string): string[] {
  if (date) {
    // Simulate different availability based on date
    if (date.toLowerCase().includes("monday")) {
      return ["Monday 9:00 AM - 10:00 AM", "Monday 2:00 PM - 3:00 PM"];
    } else if (date.toLowerCase().includes("tuesday")) {
      return ["Tuesday 10:00 AM - 11:00 AM"];
    } else {
      return [`No specific availability for ${date}.`];
    }
  } else {
    return [
      "Monday 9:00 AM - 10:00 AM",
      "Monday 2:00 PM - 3:00 PM",
      "Tuesday 10:00 AM - 11:00 AM",
      "Wednesday 1:00 PM - 2:00 PM",
    ];
  }
}


