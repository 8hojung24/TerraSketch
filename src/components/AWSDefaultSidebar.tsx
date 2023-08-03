import clsx from "clsx";
import { DEFAULT_SIDEBAR, LIBRARY_SIDEBAR_TAB, TERRAFORMCODE_SIDEBAR, TERRAFORMCODE_SIDEBAR_TAB, AWSLIB_SIDEBAR, AWSLIB_SIDEBAR_TAB } from "../constants";
import { useTunnels } from "../context/tunnels";
import { useUIAppState } from "../context/ui-appState";
import { t } from "../i18n";
import { MarkOptional, Merge } from "../utility-types";
import { composeEventHandlers } from "../utils";
import { useExcalidrawSetAppState } from "./App";
import { withInternalFallback } from "./hoc/withInternalFallback";
import { LibraryMenu } from "./LibraryMenu";
import { AWSLibraryMenu } from "./AWSLibraryMenu"; //AWSLibraryMenu 파일 생성 필요
import { SidebarProps, SidebarTriggerProps } from "./Sidebar/common";
import { AWSSidebar } from "./Sidebar/AWSSidebar";

//여기서부터 AWS SIDEBAR 개발
const AwsLibSidebarTrigger = withInternalFallback(
    "AwsLibSidebarTrigger",
    (
        props: Omit<SidebarTriggerProps, "name"> &
            React.HTMLAttributes<HTMLDivElement>,
    ) => {
        const { AwsLibSidebarTriggerTunnel } = useTunnels();
        return (
            <AwsLibSidebarTriggerTunnel.In>
                <AWSSidebar.Trigger
                    {...props}
                    className="default-sidebar-trigger"
                    name={AWSLIB_SIDEBAR.name}
                />
            </AwsLibSidebarTriggerTunnel.In>
        );
    },
);
AwsLibSidebarTrigger.displayName = "AwsLibSidebarTrigger";

const AwsLibTabTriggers = ({
    children,
    ...rest
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const { AwsLibSidebarTabTriggersTunnel } = useTunnels();
    return (
        <AwsLibSidebarTabTriggersTunnel.In>
            <AWSSidebar.TabTriggers {...rest}>{children}</AWSSidebar.TabTriggers>
        </AwsLibSidebarTabTriggersTunnel.In>
    );
};
AwsLibTabTriggers.displayName = "AwsLibTabTriggers";

export const AwsLibSidebar = Object.assign(
    withInternalFallback(
        "AwsLibSidebar",
        ({
            children,
            className,
            onDock,
            docked,
            ...rest
        }: Merge<
            MarkOptional<Omit<SidebarProps, "name">, "children">,
            {
                /** pass `false` to disable docking */
                onDock?: SidebarProps["onDock"] | false;
            }
        >) => {
            const appState = useUIAppState();
            const setAppState = useExcalidrawSetAppState();

            const { AwsLibSidebarTabTriggersTunnel } = useTunnels();

            return (
                <AWSSidebar
                    {...rest}
                    name="awslib"
                    key="awslib"
                    className={clsx("awslibsidebar", className)}
                    docked={docked ?? appState.awslibSidebarDockedPreference}
                    onDock={
                        onDock === false || (!onDock && docked != null)
                            ? undefined
                            : composeEventHandlers(onDock, (docked) => {
                                setAppState({ awslibSidebarDockedPreference: docked });
                            })
                    }
                >
                    <AWSSidebar.Tabs>
                        <AWSSidebar.Header>
                            {rest.__fallback && (
                                <div
                                    style={{
                                        color: "var(--color-primary)",
                                        fontSize: "1.2em",
                                        fontWeight: "bold",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        paddingRight: "1em",
                                    }}
                                >
                                    {t("toolBar.awsLib")}
                                </div>
                            )}
                            <AwsLibSidebarTabTriggersTunnel.Out />
                        </AWSSidebar.Header>
                        <AWSSidebar.Tab tab={AWSLIB_SIDEBAR_TAB}>
                            <AWSLibraryMenu />
                        </AWSSidebar.Tab>
                        {children}
                    </AWSSidebar.Tabs>
                </AWSSidebar>
            );
        },
    ),
    {
        Trigger: AwsLibSidebarTrigger,
        TabTriggers: AwsLibTabTriggers,
    },
);
