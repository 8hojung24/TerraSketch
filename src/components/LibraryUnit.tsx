import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "../components/App";
import { LibraryItem } from "../types";
import "./LibraryUnit.scss";
import { CheckboxItem } from "./CheckboxItem";
import { PlusIcon } from "./icons";
import { useLibraryItemSvg } from "../hooks/useLibraryItemSvg";

export const LibraryUnit = ({
  id,
  elements,
  isPending,
  onClick,
  selected,
  onToggle,
  onDrag,
}: {
  id: LibraryItem["id"] | /** for pending item */ null;
  elements?: LibraryItem["elements"];
  isPending?: boolean; //라이브러리 항목이 처리중인지 여부
  onClick: (id: LibraryItem["id"] | null) => void; //아이템 클릭 시 id를 인자로 받음
  selected: boolean; //아이템이 선택되었는지 여부
  onToggle: (id: string, event: React.MouseEvent) => void;
  onDrag: (id: string, event: React.DragEvent) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const svg = useLibraryItemSvg(id, elements);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    //svg가 존재하면 이미지 내부의 .style-fonts 클래스(스타일 관련) 제거
    if (svg) {
      svg.querySelector(".style-fonts")?.remove();
      node.innerHTML = svg.outerHTML; //이미지의 outerHTML을 이용해 html 내용을 업데이트
    }

    return () => {
      node.innerHTML = ""; //이전 html 내용을 비우는 역할
    };
  }, [elements, svg]);

  const [isHovered, setIsHovered] = useState(false); //상테 초기화
  const isMobile = useDevice().isMobile; //모바일 실행 여부
  const adder = isPending && (
    <div className="library-unit__adder">{PlusIcon}</div> //아이콘 표시
  );

  return (
    <div
      className={clsx("library-unit", {
        "library-unit__active": elements,
        "library-unit--hover": elements && isHovered,
        "library-unit--selected": selected,
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={clsx("library-unit__dragger", {
          "library-unit__pulse": !!isPending,
        })}
        ref={ref}
        draggable={!!elements}
        onClick={
          !!elements || !!isPending
            ? (event) => { //아이템 클릭 시 처리할 함수 정의
              if (id && event.shiftKey) { //id존재&shiftKey가 눌려있을 경우
                onToggle(id, event); //항목의 선택 여부를 검사
              } else {
                onClick(id);//그렇지 않으면 이 함수 호출해 해당 항목을 클릭한 것으로 처리
              }
            }
            : undefined
        }
        onDragStart={(event) => {
          if (!id) {
            event.preventDefault();
            return;
          }
          setIsHovered(false);
          onDrag(id, event);
        }}
      />
      {adder}
      {id && elements && (isHovered || isMobile || selected) && (
        <CheckboxItem
          checked={selected}
          onChange={(checked, event) => onToggle(id, event)}
          className="library-unit__checkbox"
        />
      )}
      {/* 아이템 ID를 표시하는 부분 추가 */}
      <div className="item-id">
        Item ID: {id}
      </div>

    </div>
  );
};
