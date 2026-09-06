import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { PrintWeekView } from "@/components/PrintWeekView";
import type { PrintInstance, PrintKid } from "@/lib/planner-data";
import messages from "../../messages/en.json";

function renderPrintWeekView(props: ComponentProps<typeof PrintWeekView>) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PrintWeekView {...props} />
    </NextIntlClientProvider>
  );
}

const kids: PrintKid[] = [
  { id: "kid-1", name: "Mia", color: "#ec4899" },
  { id: "kid-2", name: "Leo", color: "#3b82f6" },
];

const instances: PrintInstance[] = [
  {
    id: "act-1",
    kind: "recurring",
    seriesId: "series-1",
    title: "Swimming",
    startTime: "17:00",
    endTime: "18:00",
    location: "Pool",
    color: "#0ea5e9",
    dayIndex: 1,
    kidIds: ["kid-1"],
    defaultChecked: true,
  },
  {
    id: "act-2",
    kind: "recurring",
    seriesId: "series-2",
    title: "Gym class",
    startTime: "16:00",
    endTime: "17:00",
    location: "Sports Center",
    color: "#22c55e",
    dayIndex: 2,
    kidIds: ["kid-2"],
    defaultChecked: true,
  },
];

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

describe("PrintWeekView", () => {
  it("shows all default-checked events initially", () => {
    renderPrintWeekView({
      familyName: "Test Family",
      weekLabel: "Typical Week",
      kids,
      instances,
      dayLabels,
    });

    expect(screen.getAllByText("Swimming")).toHaveLength(2); // selector label + grid entry
    expect(screen.getAllByText("Gym class")).toHaveLength(2);
  });

  it("removes an event from the grid when its checkbox is unchecked", () => {
    renderPrintWeekView({
      familyName: "Test Family",
      weekLabel: "Typical Week",
      kids,
      instances,
      dayLabels,
    });

    const swimmingCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) => el.closest("label")?.textContent?.includes("Swimming"));
    expect(swimmingCheckbox).toBeDefined();

    fireEvent.click(swimmingCheckbox!);

    // Only the "Events to include" selector label should remain; the grid entry is gone.
    expect(screen.getAllByText("Swimming")).toHaveLength(1);
    expect(screen.getAllByText("Gym class")).toHaveLength(2);
  });

  it("removes a day's column when its checkbox is unchecked", () => {
    renderPrintWeekView({
      familyName: "Test Family",
      weekLabel: "Typical Week",
      kids,
      instances,
      dayLabels,
    });

    expect(screen.getAllByText("Tuesday")).toHaveLength(2); // day checkbox label + column header

    const tuesdayCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) => el.closest("label")?.textContent === "Tuesday");
    expect(tuesdayCheckbox).toBeDefined();

    fireEvent.click(tuesdayCheckbox!);

    // Only the checkbox label should remain; the column header should be gone.
    expect(screen.getAllByText("Tuesday")).toHaveLength(1);
    // Swimming was on Tuesday (dayIndex 1) for Mia — its grid entry should
    // disappear along with the column, leaving only its "Events to include"
    // selector label (which stays regardless of day selection).
    expect(screen.getAllByText("Swimming")).toHaveLength(1);
  });
});
