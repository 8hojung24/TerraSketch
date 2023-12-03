import * as RadixTabs from "@radix-ui/react-tabs";
import { useUIAppState } from "../../context/ui-appState";
import { useExcalidrawSetAppState } from "../App";

const dragHandler: React.MouseEventHandler<HTMLDivElement> = (e) => {
  const target = e.currentTarget.parentElement;
  if (!target) return;

  const resize: EventListener = (e) => {
    const right = target.getBoundingClientRect().left + target.getBoundingClientRect().width;
    const left = (e as MouseEvent).clientX;
    const width = Math.max(300, (right - left)*2/3);
    target.style.width = `${width}px`;
  };

  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', () => document.removeEventListener('mousemove', resize), { once: true });
};

export const SidebarTabs = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & Omit<React.RefAttributes<HTMLDivElement>, "onSelect">) => {
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();

  if (!appState.openSidebar) {
    return null;
  }

  const { name } = appState.openSidebar;

  return (
    <RadixTabs.Root
      className="sidebar-tabs-root"
      value={appState.openSidebar.tab}
      onValueChange={(tab) =>
        setAppState((state) => ({
          ...state,
          openSidebar: { ...state.openSidebar, name, tab },
        }))
      }
      {...rest}
      onMouseDown = {dragHandler} /*마우스 넓히기 추가함*/
    >
      {children}
    </RadixTabs.Root>
  );
};
SidebarTabs.displayName = "SidebarTabs";
