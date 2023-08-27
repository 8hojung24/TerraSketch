import { ExcalidrawProps, UIAppState } from "../types";
import LibraryMenuBrowseButton from "./LibraryMenuBrowseButton";
import clsx from "clsx";

export const LibraryMenuControlButtons = ({
  libraryReturnUrl,
  theme,
  id,
  style,
  children,
  className,
  terraform_code,
}: {
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  theme: UIAppState["theme"];
  id: string;
  style: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  terraform_code: string; //strign이 맞는지, Item..[] 인지
}) => {
  return (
    <div
      className={clsx("library-menu-control-buttons", className)}
      style={style}
    >
      <LibraryMenuBrowseButton
        id={id}
        libraryReturnUrl={libraryReturnUrl}
        theme={theme}
      />
      {children}
    </div>
  );
};
