import React, { useCallback, useState } from "react";
import { serializeLibraryAsJSON } from "../data/json";
import { t } from "../i18n";
import {
  ExcalidrawProps,
  LibraryItem,
  LibraryItems,
  UIAppState,
} from "../types";
import { arrayToMap } from "../utils";
import Stack from "./Stack";
import { MIME_TYPES } from "../constants";
import Spinner from "./Spinner";
import { duplicateElements } from "../element/newElement";
import { LibraryMenuControlButtons } from "./LibraryMenuControlButtons";
import { LibraryDropdownMenu } from "./LibraryMenuHeaderContent";
import LibraryMenuSection from "./LibraryMenuSection";

import "./LibraryMenuItems.scss";

export default function LibraryMenuItems({
  isLoading, //로딩 상태 여부
  libraryItems, //라이브러리 아이템 목록
  onAddToLibrary, //라이브러리에 아이템을 추가하는 함수
  onInsertLibraryItems, //라이브러리 아이템 삽입 함수
  pendingElements, //대기 중인 엘리먼트 목록
  theme,
  id,
  libraryReturnUrl, //라이브러리로 돌아갈 URL
  terraform_code, //테라폼요소 정의
}: {
  isLoading: boolean;
  libraryItems: LibraryItems;
  pendingElements: LibraryItem["elements"];
  onInsertLibraryItems: (libraryItems: LibraryItems) => void;
  onAddToLibrary: (elements: LibraryItem["elements"]) => void;
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  theme: UIAppState["theme"];
  id: string;
  terraform_code: string;
  //terraform_code: LibraryItem["terraform_code"]; //테라폼요소 정의
}) {
  //React 훅을 사용하여 상태 변수를 초기화 //아니근데 이코드 왜 쓴거지?
  const [selectedItems, setSelectedItems] = useState<LibraryItem["terraform_code"][]>([]);

  //라이브러리 아이템을 "published"와 "unpublished"로 분류
  const unpublishedItems = libraryItems.filter(
    (item) => item.status !== "published",
  );
  const publishedItems = libraryItems.filter(
    (item) => item.status === "published",
  );

  //라이브러리에 아무 아이템도 없을 때 표시할 버튼 상태 결정
  const showBtn = !libraryItems.length && !pendingElements.length;

  //라이브러리가 비어있는지 여부를 확인
  const isLibraryEmpty =
    !pendingElements.length &&
    !unpublishedItems.length &&
    !publishedItems.length;

  //React 훅을 사용하여 마지막 선택된 아이템을 추적
  const [lastSelectedItem, setLastSelectedItem] = useState<
    LibraryItem["id"] | null
  >(null);
  //console.log("마지막으로 선택한 아이템 ID: ", lastSelectedItem);

  //아이템을 선택 또는 선택해제
  const onItemSelectToggle = (
    id: LibraryItem["id"],
    event: React.MouseEvent,
  ) => {
    const shouldSelect = !selectedItems.includes(id);
    //"published"와 "unpublished" 아이템을 순서대로 배열
    const orderedItems = [...unpublishedItems, ...publishedItems];

    if (shouldSelect) {
      if (event.shiftKey && lastSelectedItem) {
        // Shift 키를 누른 상태에서 여러 아이템을 선택하는 경우
        const rangeStart = orderedItems.findIndex(
          (item) => item.id === lastSelectedItem,
        );
        const rangeEnd = orderedItems.findIndex((item) => item.id === id);

        if (rangeStart === -1 || rangeEnd === -1) {
          setSelectedItems([...selectedItems, id]);
          return;
        }

        // 선택한 아이템들을 포함한 범위 내의 아이템을 선택
        const selectedItemsMap = arrayToMap(selectedItems);
        const nextSelectedIds = orderedItems.reduce(
          (acc: LibraryItem["id"][], item, idx) => {
            if (
              (idx >= rangeStart && idx <= rangeEnd) ||
              selectedItemsMap.has(item.id)
            ) {
              acc.push(item.id);
            }
            return acc;
          },
          [],
        );

        setSelectedItems(nextSelectedIds);
      } else {
        // Shift 키를 누르지 않고 아이템을 선택하는 경우
        setSelectedItems([...selectedItems, id]);
      }
      setLastSelectedItem(id);
    } else {
      // 아이템 선택 해제
      setLastSelectedItem(null);
      setSelectedItems(selectedItems.filter((_id) => _id !== id));
    }
  };

  // 선택한 아이템에 대한 엘리먼트를 가져오는 함수
  const getInsertedElements = useCallback(
    (id: string) => { //id를 매개변수로 받음
      let targetElements; //함수의 반환값으로 사용
      if (selectedItems.includes(id)) { //selectedItems 배열(선택 아이템 목록)에 id가 포함되어 있는지 확인
        targetElements = libraryItems.filter((item) =>
          selectedItems.includes(item.id),
        );
      } else {
        //그렇지 않으면, targetElements에는 libraryItems 배열에서 id와 일치하는 하나의 아이템만 저장
        targetElements = libraryItems.filter((item) => item.id === id);
      }
      return targetElements.map((item) => {
        return {
          ...item,
          // 캔버스에 삽입하기 전에 각 라이브러리 아이템을 복제하여
          // ID와 바인딩을 각 라이브러리 아이템에 제한합니다.
          elements: duplicateElements(item.elements, { randomizeSeed: true }),
          //복제된 아이템은 다시 캔버스에 삽입될 때 각각 고유한 ID와 바인딩을 가지도록 보장하기 위해 사용??뭔소리
        };
      });
    },
    [libraryItems, selectedItems],
  );
  // 아이템을 드래그할 때 데이터 전송을 설정하는 함수
  const onItemDrag = (id: LibraryItem["id"], event: React.DragEvent) => {
    event.dataTransfer.setData(
      MIME_TYPES.excalidrawlib,
      serializeLibraryAsJSON(getInsertedElements(id)),
    );
  };
  // 아이템이 선택되었는지 확인하는 함수
  const isItemSelected = (id: LibraryItem["id"] | null) => {
    if (!id) {
      return false;
    }
    //console.log("아이템이 선택되었는지 확인: ", id);
    return selectedItems.includes(id);
  };

  //라이브러리 아이템을 클릭했을 때 실행되는 콜백 함수
  const onItemClick = useCallback(
    (id: LibraryItem["id"] | null) => { //id 매개변수 받음
      if (!id) { //id가 null인 경우
        onAddToLibrary(pendingElements);
      } else {
        onInsertLibraryItems(getInsertedElements(id));
        //라이브러리 아이템의 엘리먼트 목록 반환
        console.log("onInsertLibraryItems 테스트: ", id);
        console.log("테라폼 테스트: ", terraform_code);
        //여기가 확실하게 나오면 성공임

      }
    },
    [
      getInsertedElements,
      onAddToLibrary,
      onInsertLibraryItems,
      pendingElements,
    ],
  );

  return (
    <div
      className="library-menu-items-container"
      style={
        pendingElements.length ||
          unpublishedItems.length ||
          publishedItems.length
          ? { justifyContent: "flex-start" }
          : { borderBottom: 0 }
      }
    >
      {!isLibraryEmpty && (
        <LibraryDropdownMenu
          selectedItems={selectedItems}
          onSelectItems={setSelectedItems}
          className="library-menu-dropdown-container--in-heading"
        />
      )}
      <Stack.Col
        className="library-menu-items-container__items"
        align="start"
        gap={1}
        style={{
          flex: publishedItems.length > 0 ? 1 : "0 1 auto",
          marginBottom: 0,
        }}
      >
        <>
          {!isLibraryEmpty && (
            <div className="library-menu-items-container__header">
              {t("labels.pLib")} {/*개인 라이브러리 */}
            </div>
          )}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: "var(--container-padding-y)",
                right: "var(--container-padding-x)",
                transform: "translateY(50%)",
              }}
            >
              <Spinner />
            </div>
          )}
          {!pendingElements.length && !unpublishedItems.length ? (
            <div className="library-menu-items__no-items">
              <div className="library-menu-items__no-items__label">
                {t("library.noItems")}
              </div>
              <div className="library-menu-items__no-items__hint">
                {publishedItems.length > 0
                  ? t("library.hint_emptyPrivateLibrary")
                  : t("library.hint_emptyLibrary")}
              </div>
            </div>
          ) : (
            <LibraryMenuSection
              items={[
                // append pending library item
                ...(pendingElements.length
                  ? [{ id: null, elements: pendingElements }]
                  : []),
                ...unpublishedItems,
              ]}
              onItemSelectToggle={onItemSelectToggle}
              onItemDrag={onItemDrag}
              onClick={onItemClick}
              isItemSelected={isItemSelected}
            />
          )}
        </>

        <>
          {(publishedItems.length > 0 ||
            pendingElements.length > 0 ||
            unpublishedItems.length > 0) && (
              <div className="library-menu-items-container__header library-menu-items-container__header--excal">
                {t("labels.excalidrawLib")}
              </div>
            )}
          {publishedItems.length > 0 ? (
            <LibraryMenuSection
              items={publishedItems}
              onItemSelectToggle={onItemSelectToggle}
              onItemDrag={onItemDrag}
              onClick={onItemClick}
              isItemSelected={isItemSelected}
            />
          ) : unpublishedItems.length > 0 ? (
            <div
              style={{
                margin: "1rem 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                fontSize: ".9rem",
              }}
            >
              {t("library.noItems")}
            </div>
          ) : null}
        </>

        {showBtn && (
          <LibraryMenuControlButtons
            style={{ padding: "16px 0", width: "100%" }}
            id={id}
            libraryReturnUrl={libraryReturnUrl}
            theme={theme}
            terraform_code={terraform_code}
          >
            <LibraryDropdownMenu
              selectedItems={selectedItems}
              onSelectItems={setSelectedItems}
            />
          </LibraryMenuControlButtons>
        )}
      </Stack.Col>
    </div>
  );
}
