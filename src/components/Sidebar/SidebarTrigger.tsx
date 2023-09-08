import { useExcalidrawSetAppState } from "../App";
import { SidebarTriggerProps } from "./common";
import { useUIAppState } from "../../context/ui-appState";
import clsx from "clsx";

import "./SidebarTrigger.scss";

export const SidebarTrigger = ({
  name, //사이드바 이름
  tab, //사이드바에서 열리는 탭
  icon,
  title, //트리거 툴팁(마우스 올릴 시 나타나는 설명)
  children,
  onToggle, //사이드바가 열리거나 닫힐 때 호출할 콜백 함수
  className,
  style,
}: SidebarTriggerProps) => {
  const setAppState = useExcalidrawSetAppState();
  const appState = useUIAppState(); //상태 가져옴

  return (
    <label title={title}>
      <input
        className="ToolIcon_type_checkbox"
        type="checkbox"
        onChange={(event) => {
          document
            .querySelector(".layer-ui__wrapper")
            ?.classList.remove("animate");
          const isOpen = event.target.checked;
          setAppState({ openSidebar: isOpen ? { name, tab } : null });
          onToggle?.(isOpen);
        }}
        checked={appState.openSidebar?.name === name}
        aria-label={title}
        aria-keyshortcuts="0"
      />
      <div className={clsx("sidebar-trigger", className)} style={style}>
        {icon && <div>{icon}</div>}
        {children && <div className="sidebar-trigger__label">{children}</div>}
      </div>
    </label>
  );
};
SidebarTrigger.displayName = "SidebarTrigger";
