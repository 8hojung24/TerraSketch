import React from "react";
import { DEFAULT_SIDEBAR,TERRAFORMCODE_SIDEBAR, AWSLIB_SIDEBAR} from "../constants";
import { DefaultSidebar, TerraformCodeSidebar, AwsLibSidebar } from "../packages/excalidraw/index";
import {
  fireEvent,
  waitFor,
  withExcalidrawDimensions,
} from "../tests/test-utils";
import {
  assertExcalidrawWithSidebar,
  assertSidebarDockButton,
} from "./Sidebar/Sidebar.test";

const { h } = window;

describe("DefaultSidebar", () => {
  it("when `docked={undefined}` & `onDock={undefined}`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar />,
      DEFAULT_SIDEBAR.name,
      async () => {
        expect(h.state.defaultSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.defaultSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.defaultSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  })

  it("when `docked={undefined}` & `onDock`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar onDock={() => {}} />,
      DEFAULT_SIDEBAR.name,
      async () => {
        expect(h.state.defaultSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.defaultSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.defaultSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  });

  it("when `docked={true}` & `onDock`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar onDock={() => {}} />,
      DEFAULT_SIDEBAR.name,
      async () => {
        expect(h.state.defaultSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.defaultSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.defaultSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  });

  it("when `onDock={false}`, should disable docking", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar onDock={false} />,
      DEFAULT_SIDEBAR.name,
      async () => {
        await withExcalidrawDimensions(
          { width: 1920, height: 1080 },
          async () => {
            expect(h.state.defaultSidebarDockedPreference).toBe(false);

            await assertSidebarDockButton(false);
          },
        );
      },
    );
  });

  it("when `docked={true}` & `onDock={false}`, should force-dock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar docked onDock={false} />,
      DEFAULT_SIDEBAR.name,
      async () => {
        expect(h.state.defaultSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).toHaveClass("sidebar--docked");
      },
    );
  });

  it("when `docked={true}` & `onDock={undefined}`, should force-dock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar docked />,
      DEFAULT_SIDEBAR.name,
      async () => {
        expect(h.state.defaultSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).toHaveClass("sidebar--docked");
      },
    );
  });

  it("when `docked={false}` & `onDock={undefined}`, should force-undock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <DefaultSidebar docked={false} />,
      DEFAULT_SIDEBAR.name,
      async () => {
        expect(h.state.defaultSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).not.toHaveClass("sidebar--docked");
      },
    );
  });
});

describe("TerraformCodeSidebar", () => {
  it("when `docked={undefined}` & `onDock={undefined}`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.terraformcodeSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  })

  it("when `docked={undefined}` & `onDock`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar onDock={() => {}} />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.terraformcodeSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  });

  it("when `docked={true}` & `onDock`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar onDock={() => {}} />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.terraformcodeSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  });

  it("when `onDock={false}`, should disable docking", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar onDock={false} />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        await withExcalidrawDimensions(
          { width: 1920, height: 1080 },
          async () => {
            expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

            await assertSidebarDockButton(false);
          },
        );
      },
    );
  });

  it("when `docked={true}` & `onDock={false}`, should force-dock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar docked onDock={false} />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).toHaveClass("sidebar--docked");
      },
    );
  });

  it("when `docked={true}` & `onDock={undefined}`, should force-dock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar docked />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).toHaveClass("sidebar--docked");
      },
    );
  });

  it("when `docked={false}` & `onDock={undefined}`, should force-undock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <TerraformCodeSidebar docked={false} />,
      TERRAFORMCODE_SIDEBAR.name,
      async () => {
        expect(h.state.terraformcodeSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).not.toHaveClass("sidebar--docked");
      },
    );
  });
});

//AWS
describe("AwsLibSidebar", () => {
  it("when `docked={undefined}` & `onDock={undefined}`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar />,
      AWSLIB_SIDEBAR.name,
      async () => {
        expect(h.state.awslibSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.awslibSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.awslibSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  })

  it("when `docked={undefined}` & `onDock`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar onDock={() => {}} />,
      AWSLIB_SIDEBAR.name,
      async () => {
        expect(h.state.awslibSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.awslibSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.awslibSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  });

  it("when `docked={true}` & `onDock`, should allow docking", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar onDock={() => {}} />,
      AWSLIB_SIDEBAR.name,
      async () => {
        expect(h.state.awslibSidebarDockedPreference).toBe(false);

        const { dockButton } = await assertSidebarDockButton(true);

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.awslibSidebarDockedPreference).toBe(true);
          expect(dockButton).toHaveClass("selected");
        });

        fireEvent.click(dockButton);
        await waitFor(() => {
          expect(h.state.awslibSidebarDockedPreference).toBe(false);
          expect(dockButton).not.toHaveClass("selected");
        });
      },
    );
  });

  it("when `onDock={false}`, should disable docking", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar onDock={false} />,
      AWSLIB_SIDEBAR.name,
      async () => {
        await withExcalidrawDimensions(
          { width: 1920, height: 1080 },
          async () => {
            expect(h.state.awslibSidebarDockedPreference).toBe(false);

            await assertSidebarDockButton(false);
          },
        );
      },
    );
  });

  it("when `docked={true}` & `onDock={false}`, should force-dock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar docked onDock={false} />,
      AWSLIB_SIDEBAR.name,
      async () => {
        expect(h.state.awslibSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).toHaveClass("sidebar--docked");
      },
    );
  });

  it("when `docked={true}` & `onDock={undefined}`, should force-dock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar docked />,
      AWSLIB_SIDEBAR.name,
      async () => {
        expect(h.state.awslibSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).toHaveClass("sidebar--docked");
      },
    );
  });

  it("when `docked={false}` & `onDock={undefined}`, should force-undock sidebar", async () => {
    await assertExcalidrawWithSidebar(
      <AwsLibSidebar docked={false} />,
      AWSLIB_SIDEBAR.name,
      async () => {
        expect(h.state.awslibSidebarDockedPreference).toBe(false);

        const { sidebar } = await assertSidebarDockButton(false);
        expect(sidebar).not.toHaveClass("sidebar--docked");
      },
    );
  });
});