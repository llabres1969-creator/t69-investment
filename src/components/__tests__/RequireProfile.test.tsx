import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RequireProfile } from "@/components/RequireProfile";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  localStorage.clear();
  replace.mockClear();
});

describe("RequireProfile", () => {
  it("renders children once a profile score is found in localStorage", async () => {
    localStorage.setItem("t69_profile_score", "42");

    render(
      <RequireProfile>
        <div>contenido protegido</div>
      </RequireProfile>,
    );

    await waitFor(() => {
      expect(screen.getByText("contenido protegido")).toBeInTheDocument();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /test and renders nothing when no profile score is saved", async () => {
    render(
      <RequireProfile>
        <div>contenido protegido</div>
      </RequireProfile>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/test");
    });
    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });
});
