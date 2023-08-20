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

import "./AWSLibraryMenuItems.scss";

export default function AWSLibraryMenuItems({
    isLoading, //메뉴 로딩중인지 여부
    libraryItems, //메뉴에 표시할 라이브러리 항목 배열
    onAddToLibrary, //라이브러리에 요소 추가 처리
    onInsertLibraryItems, //캔버스에 라이브러리 항목 삽입 처리
    pendingElements, //라이브러리에 추가 대기중인 요소
    theme,
    id, //구성요소 식별자
    libraryReturnUrl, //라이브러리와 상호작용 후 반환할 URL
}: {
    isLoading: boolean;
    libraryItems: LibraryItems;
    pendingElements: LibraryItem["elements"];
    onInsertLibraryItems: (libraryItems: LibraryItems) => void;
    onAddToLibrary: (elements: LibraryItem["elements"]) => void;
    libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
    theme: UIAppState["theme"];
    id: string;
}) {
    const [selectedItems, setSelectedItems] = useState<LibraryItem["id"][]>([]);
    //선택한 라이브러리 항목을 추적하기 위한 상태 변수

    //라이브러리 항목 필터링: unpublishedItems, publishedItems
    const unpublishedItems = libraryItems.filter(
        (item) => item.status !== "published",
    );
    const publishedItems = libraryItems.filter(
        (item) => item.status === "published",
    );

    //버튼 표시 여부 결정
    const showBtn = !libraryItems.length && !pendingElements.length;

    //빈 라이브러리
    const isLibraryEmpty =
        !pendingElements.length &&
        !unpublishedItems.length &&
        !publishedItems.length;

    //라이브러리가 비어 있는지 여부를 결정
    const [lastSelectedItem, setLastSelectedItem] = useState<
        LibraryItem["id"] | null
    >(null);

    //선택된 라이브러리 항목을 추적하기 위한 상태 변수
    const onItemSelectToggle = (
        id: LibraryItem["id"], //아이템 id 가져옴
        event: React.MouseEvent, //마우스 이벤트 감지
    ) => {
        const shouldSelect = !selectedItems.includes(id);
        //shouldSelect변수: 선택된 항목이면 false, 선택되지 않은 항목이면 true

        const orderedItems = [...unpublishedItems, ...publishedItems];
        //unpublishedItems, publishedItems 배열을 합쳐 라이브러리 항목을 하나의 배열로 만듦

        if (shouldSelect) { //shouldSelect이 true인 경우(아직 선택되지 않은 항목)
            if (event.shiftKey && lastSelectedItem) { //Shift 키 누른 상태에서 여러 항목 선택
                const rangeStart = orderedItems.findIndex(
                    (item) => item.id === lastSelectedItem, //선택한 여러 항목 중 마지막으로 선택한것의 id
                );//마지막이 탐지될 경우 이것의 인덱스 찾음
                const rangeEnd = orderedItems.findIndex((item) => item.id === id);

                if (rangeStart === -1 || rangeEnd === -1) {
                    setSelectedItems([...selectedItems, id]);
                    return;
                }//여기까지 shift 키로 여러 항목 선택하는 경우에 대한 코드


                const selectedItemsMap = arrayToMap(selectedItems);
                //선택 아이템을 Map(사전) 형태로 변환 -> 선택 항목의 Id를 key로 갖고있음
                const nextSelectedIds = orderedItems.reduce( //배열 값 순회하면서 누적
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
                );//여기까지도 shift 키로 여러 항목 선택하는 경우에 대한 코드

                setSelectedItems(nextSelectedIds);
            } else {
                setSelectedItems([...selectedItems, id]);
            }
            setLastSelectedItem(id);
        } else {
            setLastSelectedItem(null);
            setSelectedItems(selectedItems.filter((_id) => _id !== id));
        }
    };//여기까지도 shift 키로 여러 항목 선택하는 경우에 대한 코드


    //라이브러리 항목의 id에 따라 어떤 요소를 반환할지 결정
    const getInsertedElements = useCallback(
        (id: string) => { //id 문자열 받아옴
            let targetElements; //나중에 반환될 요소들을 저장
            if (selectedItems.includes(id)) { //현재 선택한 항목에 현재 id가 포함되어 있는지 확인
                targetElements = libraryItems.filter((item) =>
                    selectedItems.includes(item.id),
                ); //즉, 여러 항목 선택했는지 검사
            } else { //한 아이템만 선택했다면
                targetElements = libraryItems.filter((item) => item.id === id);
            }
            return targetElements.map((item) => {//선택된 항목에 대한 배열 반환
                return {
                    ...item, //현재 라이브러리의 모든 속성 복사
                    // duplicate each library item before inserting on canvas to confine
                    // ids and bindings to each library item. See #6465
                    elements: duplicateElements(item.elements, { randomizeSeed: true }),
                }; // 현재 라이브러리 항목의 elements 속성을 복제, 이에 대한 고유 id 연결 생성
            });
        },
        [libraryItems, selectedItems],
    );//즉, 요소간에 고유 id를 바인딩해 충돌 방지, 라이브러리 항목간 독립성 보장

    //드래그 항목의 id, 드래그 이벤트 파라미터 받음
    const onItemDrag = (id: LibraryItem["id"], event: React.DragEvent) => {
        event.dataTransfer.setData( //드래그 데이터 설정
            MIME_TYPES.excalidrawlib, //드래그 데이터 형식: excalidrawlib
            serializeLibraryAsJSON(getInsertedElements(id)),//아이템 JSON 형식 값
        );
    };

    //이걸 이용해서 Terraform 사이드바 여는걸 건들면 되지 않을까...?
    //아이템 ID가 현재 선택되었는지 여부
    const isItemSelected = (id: LibraryItem["id"] | null) => {
        if (!id) { //id가 null인 경우 -> 선택되지 않은 경우
            return false;
        }
        return selectedItems.includes(id); //선택 id가 배열에 포함된 경우(선택된 경우)
    };

    //라이브러리 항목 클릭 시 작업 수행
    const onItemClick = useCallback(
        (id: LibraryItem["id"] | null) => { //클릭된 아이템 id 가져옴
            if (!id) { //클릭 항목이 null인 경우
                onAddToLibrary(pendingElements);
            } else {
                onInsertLibraryItems(getInsertedElements(id));
                //클릭 항목이 유효할 경우 캔버스에 삽입하기 전 id와 바인딩
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
            {/*
            {!isLibraryEmpty && (
                <LibraryDropdownMenu
                    selectedItems={selectedItems}
                    onSelectItems={setSelectedItems}
                    className="library-menu-dropdown-container--in-heading"
                />
            )}*/}

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
                            {t("labels.personalLib")}
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


                    {/* 추가된 아이템 없음 표시 주석처리함_0819 */}
                    {/* {!pendingElements.length && !unpublishedItems.length ? (
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
                    )} */}
                </>

                <>
                    {/* {(publishedItems.length > 0 ||
                        pendingElements.length > 0 ||
                        unpublishedItems.length > 0) && (
                            <div className="library-menu-items-container__header library-menu-items-container__header--excal">
                                AWS Architecture Icons
                        </div>
                        )}*/}
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
