import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // ESM 버전 임포트
//yarn add monaco-editor 또는 npm install monaco-editor 먼저 해줘야 오류 안남

interface MonacoEditorProps {
    code: string; // code prop의 타입을 명시
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ code }) => {
    const editorRef = useRef<HTMLDivElement>(null); // null 대신에 HTMLDivElement로 타입을 명시적으로 지정

    useEffect(() => {
        if (editorRef.current) {
            // DOM 노드가 유효할 때만 실행
            // Monaco Editor 초기화
            const editor = monaco.editor.create(editorRef.current, {
                value: code,
                language: 'javascript',
                theme: 'vs-dark', // 테마 설정 (optional)
            });

            // Editor가 언마운트될 때 정리
            return () => {
                editor.dispose();
            };
        }
    }, [editorRef.current, code]); // editorRef.current를 의존성 배열에 추가하여 DOM 노드가 변경될 때마다 useEffect를 실행

    return <div ref={editorRef} style={{ width: '500px', height: '1200px' }} />;
};

export default MonacoEditor;
