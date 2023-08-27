import { loadLibraryFromBlob } from "./blob";
import {
  LibraryItems,
  LibraryItem,
  ExcalidrawImperativeAPI,
  LibraryItemsSource,
} from "../types";
import { restoreLibraryItems } from "./restore";
import type App from "../components/App";
import { atom } from "jotai";
import { jotaiStore } from "../jotai";
import { ExcalidrawElement } from "../element/types";
import { getCommonBoundingBox } from "../element/bounds";
import { AbortError } from "../errors";
import { t } from "../i18n";
import { useEffect, useRef } from "react";
import {
  URL_HASH_KEYS,
  URL_QUERY_KEYS,
  APP_NAME,
  EVENT,
  DEFAULT_SIDEBAR,
  LIBRARY_SIDEBAR_TAB,
} from "../constants";
//import {} "../../"test.excalidrawlib";

export const libraryItemsAtom = atom<{
  status: "loading" | "loaded"; //현재 아이템의 로딩상태
  isInitialized: boolean; //초기화 상태
  libraryItems: LibraryItems; //실제 라이브러리 아이템 저장하는 배열
}>({ status: "loaded", isInitialized: true, libraryItems: [] }); //초기값 설정

//아이템을 복사해 새로운 배열 생성
const cloneLibraryItems = (libraryItems: LibraryItems): LibraryItems =>
  JSON.parse(JSON.stringify(libraryItems));

/**
 * checks if library item does not exist already in current library
 */
const isUniqueItem = (
  existingLibraryItems: LibraryItems,
  targetLibraryItem: LibraryItem,
) => {
  return !existingLibraryItems.find((libraryItem) => {
    if (libraryItem.elements.length !== targetLibraryItem.elements.length) {
      return false;
    }
    //existingLibraryItems 배열에 targetLibraryItem이 이미 존재하지 않는 경우 true를 반환
    //아이템관리, 중복 확인을 위함

    return libraryItem.elements.every((libItemExcalidrawItem, idx) => {
      return (
        libItemExcalidrawItem.id === targetLibraryItem.elements[idx].id &&
        libItemExcalidrawItem.versionNonce ===
        targetLibraryItem.elements[idx].versionNonce
      );
    });
  });
};

//중복 아이템을 제외하고 새로운 아이템을 추가해 라이브러리 배열을 업데이트
export const mergeLibraryItems = (
  localItems: LibraryItems,
  otherItems: LibraryItems,
): LibraryItems => {
  const newItems = [];
  for (const item of otherItems) {
    if (isUniqueItem(localItems, item)) {
      newItems.push(item);
    }
  }

  return [...newItems, ...localItems];
};

//라이브러리 아이템 관리 담당
class Library {

  private lastLibraryItems: LibraryItems = []; //라이브러리 최근 상태 변수

  private isInitialized = false; //라이브러리 아이템으로 초기화되어 있는지

  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  private updateQueue: Promise<LibraryItems>[] = []; //라이브러리 업데이트 작업 관리

  private getLastUpdateTask = (): Promise<LibraryItems> | undefined => {
    return this.updateQueue[this.updateQueue.length - 1];
  }; //가장 최근의 라이브러리 업데이트 작업 가져옴

  //라이브러리 아이템 업데이트 상태를 감시
  private notifyListeners = () => {
    if (this.updateQueue.length > 0) { //업데이트 작업 남아있는 경우
      jotaiStore.set(libraryItemsAtom, {
        status: "loading",
        libraryItems: this.lastLibraryItems,
        isInitialized: this.isInitialized,
      });
    } else {
      this.isInitialized = true; //업데이트 된 경우
      jotaiStore.set(libraryItemsAtom, {
        status: "loaded",
        libraryItems: this.lastLibraryItems,
        isInitialized: this.isInitialized,
      });
      try {
        this.app.props.onLibraryChange?.(
          cloneLibraryItems(this.lastLibraryItems),

        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  resetLibrary = () => { //라이브러리 초기화
    return this.setLibrary([]);
  };

  //가장 최근의 라이브러리 아이템 가져옴
  getLatestLibrary = (): Promise<LibraryItems> => {
    return new Promise(async (resolve) => {
      try {
        const libraryItems = await (this.getLastUpdateTask() ||
          this.lastLibraryItems);//최근의 라이브러리 아이템 목록 가져옴
        if (this.updateQueue.length > 0) { //업데이트 될게 남아있는 경우
          resolve(this.getLatestLibrary());
        } else {
          resolve(cloneLibraryItems(libraryItems));
        }
      } catch (error) {
        return resolve(this.lastLibraryItems);
      }
    });
  };

  // 병합할 필요가 없는 경우 'library.setLibrary()'를 직접 사용합니다.
  // 라이브러리를 업데이트하는 메서드
  updateLibrary = async ({
    libraryItems, //업데이트 할 라이브러리 아이템 나타냄
    prompt = false, //아이템 업데이트 전 사용자에게 확인 메시지 표시 여부
    merge = false, //아이템을 병합할지 여부
    openLibraryMenu = false, //업데이트 후 사이드바를 자동으로 열지 여부->true로 할까?
    defaultStatus = "unpublished",//업데이트된 라이브러리 아이템의 기본 상태
  }: {
    libraryItems: LibraryItemsSource;
    merge?: boolean;
    prompt?: boolean;
    openLibraryMenu?: boolean;
    defaultStatus?: "unpublished" | "published";
  }): Promise<LibraryItems> => {
    if (openLibraryMenu) { //openLibraryMenu가 true로 설정되어 있을 때 라이브러리 메뉴 여는부분
      this.app.setState({
        openSidebar: { name: DEFAULT_SIDEBAR.name, tab: LIBRARY_SIDEBAR_TAB },
      });
    }

    return this.setLibrary(() => { //라이브러리 업데이트 처리
      return new Promise<LibraryItems>(async (resolve, reject) => {
        try { //라이브러리 항목 가져오기 전 타입 확인
          const source = await (typeof libraryItems === "function" &&
            !(libraryItems instanceof Blob)
            ? libraryItems(this.lastLibraryItems)
            : libraryItems);
          let nextItems;

          if (source instanceof Blob) { //데이터 소스가 Blob객체인 경우
            nextItems = await loadLibraryFromBlob(source, defaultStatus);
          } else {
            nextItems = restoreLibraryItems(source, defaultStatus);
          }
          if ( //사용자에게 확인 메시지를 표시 후 업데이트/취소
            !prompt ||
            window.confirm(
              t("alerts.confirmAddLibrary", {
                numShapes: nextItems.length,
              }),
            )
          ) {
            if (prompt) { //사용자가 확인을 눌렀을 때, 필요한 경우 앱의 컨테이너에 포커스
              this.app.focusContainer();
            }

            if (merge) { //업데이트 방법에 따라 라이브러리 항목을 병합 또는 교체
              resolve(mergeLibraryItems(this.lastLibraryItems, nextItems));
              //console.log(libraryItems);
            } else {
              resolve(nextItems);
            }
          } else {
            reject(new AbortError());
          }
        } catch (error: any) {
          reject(error);
        }
      });
    });
  };

  //콜백에서 라이브러리 항목을 수동으로 병합할 수 있습니다
  //라이브러리를 업데이트하고 관리하는 핵심 로직
  setLibrary = (
    libraryItems: //라이브러리 업데이트시 사용
      | LibraryItems
      | Promise<LibraryItems>
      | ((
        latestLibraryItems: LibraryItems,
      ) => LibraryItems | Promise<LibraryItems>),
  ): Promise<LibraryItems> => {
    const task = new Promise<LibraryItems>(async (resolve, reject) => {
      try {
        await this.getLastUpdateTask(); //햔제 진행중인 업데이트 완료시까지 대기
        //->순차적인 업데이트 보장

        if (typeof libraryItems === "function") {
          libraryItems = libraryItems(this.lastLibraryItems);
        }//최신 라이브러리 항목을 기반으로 새 라이브러리 항목을 생성

        this.lastLibraryItems = cloneLibraryItems(await libraryItems);
        //console.log(libraryItems);

        //새로운 libraryItems를 현재 라이브러리 항목으로 설정

        resolve(this.lastLibraryItems);//업데이트된 라이브러리 항목을 반환
      } catch (error: any) {
        reject(error);
      }
    })
      //업데이트 중단 시 에러
      .catch((error) => {
        if (error.name === "AbortError") {
          console.warn("Library update aborted by user");
          return this.lastLibraryItems;
        }
        throw error;
      })
      .finally(() => {
        this.updateQueue = this.updateQueue.filter((_task) => _task !== task);
        this.notifyListeners();
      });

    this.updateQueue.push(task);
    this.notifyListeners();//라이브러리 업데이트 상태를 리스너에 알림

    return task;
  };
}

export default Library;

//라이브러리 항목을 정사각형 그리드에 분산시키는 역할
export const distributeLibraryItemsOnSquareGrid = ( //분산시킬 라이브러리 항목들이 포함됨
  libraryItems: LibraryItems,
) => {
  const PADDING = 50; //각 항목 간의 여백 정의
  const ITEMS_PER_ROW = Math.ceil(Math.sqrt(libraryItems.length));
  //한 행에 배치할 항목 수 정의

  //최종적으로 분산된 요소를 저장하는 배열
  const resElements: ExcalidrawElement[] = [];

  //각 항목의 높이/너비 계산
  const getMaxHeightPerRow = (row: number) => {
    const maxHeight = libraryItems
      .slice(row * ITEMS_PER_ROW, row * ITEMS_PER_ROW + ITEMS_PER_ROW)
      .reduce((acc, item) => {
        const { height } = getCommonBoundingBox(item.elements);
        return Math.max(acc, height);
      }, 0);
    return maxHeight;
  };

  //그리드 레이아웃 계산
  const getMaxWidthPerCol = (targetCol: number) => {
    let index = 0;
    let currCol = 0;
    let maxWidth = 0;
    for (const item of libraryItems) {
      if (index % ITEMS_PER_ROW === 0) {
        currCol = 0;
      }
      if (currCol === targetCol) {
        const { width } = getCommonBoundingBox(item.elements);
        maxWidth = Math.max(maxWidth, width);
      }
      index++;
      currCol++;
    }
    return maxWidth;
  };

  let colOffsetX = 0;
  let rowOffsetY = 0;

  let maxHeightCurrRow = 0;
  let maxWidthCurrCol = 0;

  let index = 0;
  let col = 0;
  let row = 0;

  for (const item of libraryItems) {
    if (index && index % ITEMS_PER_ROW === 0) {
      rowOffsetY += maxHeightCurrRow + PADDING;
      colOffsetX = 0;
      col = 0;
      row++;
    }

    if (col === 0) {
      maxHeightCurrRow = getMaxHeightPerRow(row);
    }
    maxWidthCurrCol = getMaxWidthPerCol(col);

    const { minX, minY, width, height } = getCommonBoundingBox(item.elements);
    const offsetCenterX = (maxWidthCurrCol - width) / 2;
    const offsetCenterY = (maxHeightCurrRow - height) / 2;
    resElements.push(
      // eslint-disable-next-line no-loop-func
      ...item.elements.map((element) => ({
        ...element,
        x:
          element.x +
          // offset for column
          colOffsetX +
          // offset to center in given square grid
          offsetCenterX -
          // subtract minX so that given item starts at 0 coord
          minX,
        y:
          element.y +
          // offset for row
          rowOffsetY +
          // offset to center in given square grid
          offsetCenterY -
          // subtract minY so that given item starts at 0 coord
          minY,
      })),
    );
    colOffsetX += maxWidthCurrCol + PADDING;
    index++;
    col++;
  }

  return resElements;
};



export const parseLibraryTokensFromUrl = () => {
  const libraryUrl = "https://libraries.excalidraw.com/libraries/childishgirl/aws-architecture-icons.excalidrawlib";
  //바로 라이브러리에 AWS 아이콘이 추가되도록 함
  // current
  /*new URLSearchParams(window.location.hash.slice(1)).get(
    URL_HASH_KEYS.addLibrary,
  ) ||
  // legacy, kept for compat reasons
  new URLSearchParams(window.location.search).get(URL_QUERY_KEYS.addLibrary);
  */
  const idToken = libraryUrl
    ? new URLSearchParams(window.location.hash.slice(1)).get("token")
    : null;
  return libraryUrl ? { libraryUrl, idToken } : null;
};

//라이브러리를 관리하기 위한 커스텀 훅
//Excalidraw API에 접근할 수 있어야 함
export const useHandleLibrary = ({
  excalidrawAPI,
  getInitialLibraryItems, //초기 라이브러리 항목 가져옴
}: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  getInitialLibraryItems?: () => LibraryItemsSource;
}) => {
  //const getInitialLibraryRef = useRef(getInitialLibraryItems);

  useEffect(() => { //컴포넌트가 렌더링될 때 특정 동작을 수행
    if (!excalidrawAPI) {
      return;
    }

    //라이브러리 URL에서 데이터를 가져와 라이브러리를 업데이트
    const importLibraryFromURL = async ({
      libraryUrl,
      idToken,
    }: {
      libraryUrl: string;
      idToken: string | null;
    }) => {
      const libraryPromise = new Promise<Blob>(async (resolve, reject) => {
        try {
          const request = await fetch(decodeURIComponent(libraryUrl));
          const blob = await request.blob();
          resolve(blob);
        } catch (error: any) {
          reject(error);
        }

      });

      const shouldPrompt = idToken !== excalidrawAPI.id;
      //사용자에게 라이브러리 업데이트를 확인할 지 여부를 결정

      // wait for the tab to be focused before continuing in case we'll prompt
      // for confirmation
      /*await (shouldPrompt && document.hidden
        ? new Promise<void>((resolve) => {
            window.addEventListener("focus", () => resolve(), {
              once: true,
            });
          })
        : null);*/

      try { //excalidrawAPI를 사용하여 라이브러리를 업데이트하는 과정
        await excalidrawAPI.updateLibrary({
          libraryItems: libraryPromise, //가져온 라이브러리 아이템 데이터(Blob 형식).
          prompt: false, //alert 창 뜨지 않게 함(false)
          merge: true, //기존 라이브러리 아이템과 가져온 아이템을 병합할지 여부
          defaultStatus: "published",
          openLibraryMenu: true, //라이브러리 메뉴를 열지 여부
        });
      } catch (error) {
        throw error;
      } finally {
        if (window.location.hash.includes(URL_HASH_KEYS.addLibrary)) {
          const hash = new URLSearchParams(window.location.hash.slice(1));
          hash.delete(URL_HASH_KEYS.addLibrary);
          window.history.replaceState({}, APP_NAME, `#${hash.toString()}`);
        } else if (window.location.search.includes(URL_QUERY_KEYS.addLibrary)) {
          const query = new URLSearchParams(window.location.search);
          query.delete(URL_QUERY_KEYS.addLibrary);
          window.history.replaceState({}, APP_NAME, `?${query.toString()}`);
        }
      }
    };
    const onHashChange = (event: HashChangeEvent) => {
      event.preventDefault();
      const libraryUrlTokens = parseLibraryTokensFromUrl();
      if (libraryUrlTokens) {
        event.stopImmediatePropagation();
        // If hash changed and it contains library url, import it and replace
        // the url to its previous state (important in case of collaboration
        // and similar).
        // Using history API won't trigger another hashchange.
        window.history.replaceState({}, "", event.oldURL);

        importLibraryFromURL(libraryUrlTokens);
      }
    };

    // -------------------------------------------------------------------------
    // ------ init load --------------------------------------------------------
    /*if (getInitialLibraryRef.current) {
      excalidrawAPI.updateLibrary({
        libraryItems: getInitialLibraryRef.current(),
      });
    }*/

    const libraryUrlTokens = parseLibraryTokensFromUrl();

    if (libraryUrlTokens) {
      importLibraryFromURL(libraryUrlTokens);
    }
    // --------------------------------------------------------- init load -----

    window.addEventListener(EVENT.HASHCHANGE, onHashChange);
    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange);
    };
  }, [excalidrawAPI]);
};
