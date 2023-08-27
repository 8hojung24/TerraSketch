import React, { useCallback } from "react";
import Library, {
  distributeLibraryItemsOnSquareGrid,
  libraryItemsAtom,
} from "../data/library";
import { t } from "../i18n";
import { randomId } from "../random";
import {
  LibraryItems,
  LibraryItem,
  ExcalidrawProps,
  UIAppState,
} from "../types";
import LibraryMenuItems from "./LibraryMenuItems";
import { trackEvent } from "../analytics";
import { atom, useAtom } from "jotai";
import { jotaiScope } from "../jotai";
import Spinner from "./Spinner";
import {
  useApp,
  useAppProps,
  useExcalidrawElements,
  useExcalidrawSetAppState,
} from "./App";
import { getSelectedElements } from "../scene";
import { useUIAppState } from "../context/ui-appState";

import "./LibraryMenu.scss";
import { LibraryMenuControlButtons } from "./LibraryMenuControlButtons";

export const isLibraryMenuOpenAtom = atom(false);

const LibraryMenuWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="layer-ui__library">{children}</div>;
};

export const LibraryMenuContent = ({
  onInsertLibraryItems,
  pendingElements,
  onAddToLibrary,
  setAppState,
  libraryReturnUrl,
  library,
  id,
  appState,
  terraform_code,
}: {
  pendingElements: LibraryItem["elements"];
  onInsertLibraryItems: (libraryItems: LibraryItems) => void;
  onAddToLibrary: () => void;
  setAppState: React.Component<any, UIAppState>["setState"];
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  library: Library;
  id: string;
  appState: UIAppState;
  //terraform_code: string;
  terraform_code: LibraryItem["terraform_code"]; //이게 맞을지 string일지
}) => {
  const [libraryItemsData] = useAtom(libraryItemsAtom, jotaiScope);

  const addToLibrary = useCallback(
    async (elements: LibraryItem["elements"], libraryItems: LibraryItems, terraform_code: LibraryItem["terraform_code"]) => {
      trackEvent("element", "addToLibrary", "ui");
      {/*if (elements.some((element) => element.type === "image")) {
        return setAppState({
          errorMessage: "Support for adding images to the library coming soon!",
        });
      }*/} //이미지만 올릴 수 있게 하는 제한속성 삭제
      const nextItems: LibraryItems = [
        {
          status: "unpublished",
          elements,
          id: randomId(),
          created: Date.now(),
          terraform_code, //위에 elements 속성 따라한것 
          //위에 async에도 새로 정의 해줬음
        },
        ...libraryItems,
      ];
      onAddToLibrary();
      library.setLibrary(nextItems).catch(() => {
        setAppState({ errorMessage: t("alerts.errorAddingToLibrary") });
      });
    },
    [onAddToLibrary, library, setAppState],
  );

  if (
    libraryItemsData.status === "loading" &&
    !libraryItemsData.isInitialized
  ) {
    return (
      <LibraryMenuWrapper>
        <div className="layer-ui__library-message">
          <div>
            <Spinner size="2em" />
            <span>{t("labels.libraryLoadingMessage")}</span>
          </div>
        </div>
      </LibraryMenuWrapper>
    );
  }

  const showBtn =
    libraryItemsData.libraryItems.length > 0 || pendingElements.length > 0;

  return (
    <LibraryMenuWrapper>
      <LibraryMenuItems
        isLoading={libraryItemsData.status === "loading"}
        libraryItems={libraryItemsData.libraryItems}
        onAddToLibrary={(elements) =>
          addToLibrary(elements, libraryItemsData.libraryItems, terraform_code) //여기도 오류나서 테라폼 추가함
        }
        onInsertLibraryItems={onInsertLibraryItems}
        pendingElements={pendingElements}
        id={id}
        libraryReturnUrl={libraryReturnUrl}
        theme={appState.theme}
        terraform_code={terraform_code}
      />
      {showBtn && (
        <LibraryMenuControlButtons
          className="library-menu-control-buttons--at-bottom"
          style={{ padding: "16px 12px 0 12px" }}
          id={id}
          libraryReturnUrl={libraryReturnUrl}
          theme={appState.theme}
          terraform_code={terraform_code}
        />
      )}
    </LibraryMenuWrapper>
  );
};

/**
 * This component is meant to be rendered inside <Sidebar.Tab/> inside our
 * <DefaultSidebar/> or host apps Sidebar components.
 */
export const LibraryMenu = () => {
  //오류 안나려면 types.ts에도 변수 속성 추가해야 함
  const { library, id, onInsertElements, terraform_code } = useApp(); //terraform_code 추가?, terraform_code
  //useApp 커스텀 훅을 사용하여 library, id, onInsertElements 변수를 추출
  const appProps = useAppProps();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const elements = useExcalidrawElements();


  const onAddToLibrary = useCallback(() => {
    // deselect canvas elements
    setAppState({
      selectedElementIds: {},
      selectedGroupIds: {},
    });
  }, [setAppState]);
  return (
    <LibraryMenuContent
      pendingElements={getSelectedElements(elements, appState, true)}
      onInsertLibraryItems={(libraryItems) => {
        onInsertElements(distributeLibraryItemsOnSquareGrid(libraryItems));
      }}
      onAddToLibrary={onAddToLibrary}
      setAppState={setAppState}
      libraryReturnUrl={appProps.libraryReturnUrl}
      library={library}
      id={id}
      appState={appState}
      terraform_code={terraform_code} //여기가 포인트인데 왜 아무것도 안뜸
    />
  );
};
