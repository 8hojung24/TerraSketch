import React, { useRef, useEffect, useState } from 'react';
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
import { SidebarProps, SidebarTriggerProps } from "./Sidebar/common";
import { Sidebar } from "./Sidebar/Sidebar";                   

import MonacoEditor from './MonacoEditor';
import { AWSLibraryMenu } from "./AWSLibraryMenu";
import { firestorecode } from "../firebase";
import { Firestore } from 'firebase/firestore';

//기본 사이드바 트리거
const DefaultSidebarTrigger = withInternalFallback(
  "DefaultSidebarTrigger",
  (
    props: Omit<SidebarTriggerProps, "name"> &
      React.HTMLAttributes<HTMLDivElement>,
  ) => {
    const { DefaultSidebarTriggerTunnel } = useTunnels();
    return (
      <DefaultSidebarTriggerTunnel.In>
        <Sidebar.Trigger // 사이드바 트리거 역할
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
      <Sidebar.TabTriggers {...rest}>{children}</Sidebar.TabTriggers>
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
        <Sidebar
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
          <Sidebar.Tabs>
            <Sidebar.Header>
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
            </Sidebar.Header>
            <Sidebar.Tab tab={LIBRARY_SIDEBAR_TAB}>
              <LibraryMenu />
            </Sidebar.Tab>
            {children}
          </Sidebar.Tabs>
        </Sidebar>
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
        <Sidebar.Trigger
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
      <Sidebar.TabTriggers {...rest}>{children}</Sidebar.TabTriggers>
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
      const [fieldValues, setFieldValues] = useState<string |undefined>(undefined);

      /*DB Firebase 연동*/
      useEffect(() => {     //useEffect 사용이유: 렌더링과 관련없어서, 비동기적으로 데이터를 가져오기 위해 사용됨.
        const fetchData = async () => {
          try {
            const collectionRef = firestorecode.collection('Terraform 5.21.0 버전');
            const snapshot = await collectionRef.get();
            let fieldValue: string[] = [];
    
            snapshot.forEach((doc) => {
              const data = doc.data();
              // 여기에서 특정 필드에 있는 데이터를 가져올 수 있습니다.
              // 예를 들어, 'field_name'은 가져오려는 필드명입니다.
              fieldValue.push(data.code);
              // 특정 필드의 값 콘솔에 출력
              console.log(fieldValue);
            });
          setFieldValues(fieldValue.join('\n'));

          } catch (error) {
            console.error('Error fetching data: ', error);
          }
        };
        fetchData();
      }, []);
      /*DB Firebase 연동 FIN*/
      // const returnValue = fieldValues.join('\n');

      return (
        <Sidebar
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
          <Sidebar.Tabs>
            <Sidebar.Header>
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
                    width: "100%"
                  }}
                >
                  {t("toolBar.terraformCode")}
                </div>
              )}
              <TerraformCodeSidebarTabTriggersTunnel.Out />
            </Sidebar.Header>
            <Sidebar.Tab tab={TERRAFORMCODE_SIDEBAR_TAB}>
              {/* Terraform Code창 작성필요 (ex.<LibraryMenu/>) */}
              <MonacoEditor code={fieldValues ?? ''} style={{width:'200%', height:'100%'}}/>
            </Sidebar.Tab>
            {children}
          </Sidebar.Tabs>
        </Sidebar>
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
        <Sidebar.Trigger
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
      <Sidebar.TabTriggers {...rest}>{children}</Sidebar.TabTriggers>
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
        <Sidebar
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
          <Sidebar.Tabs>
            <Sidebar.Header>
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
            </Sidebar.Header>
            <Sidebar.Tab tab={AWSLIB_SIDEBAR_TAB}>
              <AWSLibraryMenu />
            </Sidebar.Tab>
            {children}
          </Sidebar.Tabs>
        </Sidebar>
      );
    },
  ),
  {
    Trigger: AwsLibSidebarTrigger,
    TabTriggers: AwsLibTabTriggers,
  },
);