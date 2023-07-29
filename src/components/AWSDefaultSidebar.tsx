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

const DefaultSidebarTrigger = withInternalFallback(
    "DefaultSidebarTrigger",
    (
        props: Omit<SidebarTriggerProps, "name"> &
            React.HTMLAttributes<HTMLDivElement>,
    ) => {
        const { DefaultSidebarTriggerTunnel } = useTunnels();
        return (
            <DefaultSidebarTriggerTunnel.In>
                <AWSSidebar.Trigger
                    {...props}
                    className="default-sidebar-trigger"
                    name={DEFAULT_SIDEBAR.name}
                />
            </DefaultSidebarTriggerTunnel.In>
        );
    },
);
DefaultSidebarTrigger.displayName = "DefaultSidebarTrigger";

const DefaultTabTriggers = ({
    children,
    ...rest
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const { DefaultSidebarTabTriggersTunnel } = useTunnels();
    return (
        <DefaultSidebarTabTriggersTunnel.In>
            <AWSSidebar.TabTriggers {...rest}>{children}</AWSSidebar.TabTriggers>
        </DefaultSidebarTabTriggersTunnel.In>
    );
};
DefaultTabTriggers.displayName = "DefaultTabTriggers";

export const DefaultSidebar = Object.assign(
    withInternalFallback(
        "DefaultSidebar",
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

            const { DefaultSidebarTabTriggersTunnel } = useTunnels();

            return (
                <AWSSidebar
                    {...rest}
                    name="default"
                    key="default"
                    className={clsx("default-sidebar", className)}
                    docked={docked ?? appState.defaultSidebarDockedPreference}
                    onDock={
                        // `onDock=false` disables docking.
                        // if `docked` passed, but no onDock passed, disable manual docking.
                        onDock === false || (!onDock && docked != null)
                            ? undefined
                            : // compose to allow the host app to listen on default behavior
                            composeEventHandlers(onDock, (docked) => {
                                setAppState({ defaultSidebarDockedPreference: docked });
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
                                    {t("toolBar.library")}
                                </div>
                            )}
                            <DefaultSidebarTabTriggersTunnel.Out />
                        </AWSSidebar.Header>
                        <AWSSidebar.Tab tab={LIBRARY_SIDEBAR_TAB}>
                            <LibraryMenu />
                        </AWSSidebar.Tab>
                        {children}
                    </AWSSidebar.Tabs>
                </AWSSidebar>
            );
        },
    ),
    {
        Trigger: DefaultSidebarTrigger,
        TabTriggers: DefaultTabTriggers,
    },
);

//여기서부터 TERRAFORMCODE_SIDEBAR 개발

const TerraformCodeSidebarTrigger = withInternalFallback(
    "TerraformCodeSidebarTrigger",
    (
        props: Omit<SidebarTriggerProps, "name"> &
            React.HTMLAttributes<HTMLDivElement>,
    ) => {
        const { TerraformCodeSidebarTriggerTunnel } = useTunnels();
        return (
            <TerraformCodeSidebarTriggerTunnel.In>
                <AWSSidebar.Trigger
                    {...props}
                    className="default-sidebar-trigger"
                    name={TERRAFORMCODE_SIDEBAR.name}
                />
            </TerraformCodeSidebarTriggerTunnel.In>
        );
    },
);
TerraformCodeSidebarTrigger.displayName = "TerraformCodeSidebarTrigger";

const TerraformCodeTabTriggers = ({
    children,
    ...rest
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    const { TerraformCodeSidebarTabTriggersTunnel } = useTunnels();
    return (
        <TerraformCodeSidebarTabTriggersTunnel.In>
            <AWSSidebar.TabTriggers {...rest}>{children}</AWSSidebar.TabTriggers>
        </TerraformCodeSidebarTabTriggersTunnel.In>
    );
};
TerraformCodeTabTriggers.displayName = "TerraformCodeTabTriggers";

export const TerraformCodeSidebar = Object.assign(
    withInternalFallback(
        "TerraformCodeSidebar",
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

            const { TerraformCodeSidebarTabTriggersTunnel } = useTunnels();

            return (
                <AWSSidebar
                    {...rest}
                    name="terraformcode"
                    key="terraformcode"
                    className={clsx("terraformcodesidebar", className)}
                    docked={docked ?? appState.terraformcodeSidebarDockedPreference}
                    onDock={
                        onDock === false || (!onDock && docked != null)
                            ? undefined
                            : composeEventHandlers(onDock, (docked) => {
                                setAppState({ terraformcodeSidebarDockedPreference: docked });
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
                                    {t("toolBar.terraformCode")}
                                </div>
                            )}
                            <TerraformCodeSidebarTabTriggersTunnel.Out />
                        </AWSSidebar.Header>
                        <AWSSidebar.Tab tab={TERRAFORMCODE_SIDEBAR_TAB}>
                            {/* Terraform Code창 작성필요 (ex.<LibraryMenu/>) */}
                        </AWSSidebar.Tab>
                        {children}
                    </AWSSidebar.Tabs>
                </AWSSidebar>
            );
        },
    ),
    {
        Trigger: TerraformCodeSidebarTrigger,
        TabTriggers: TerraformCodeTabTriggers,
    },
);


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
