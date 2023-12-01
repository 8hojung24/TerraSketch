import React, { StyleHTMLAttributes, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // ESM 버전 임포트
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'; // JavaScript 언어 정의를 불러옴
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript'; // JavaScript 언어 불러오기
//yarn add monaco-editor 또는 npm install monaco-editor 먼저 해줘야 오류 안남

interface MonacoEditorProps {
    code: string;
    style: React.CSSProperties;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ code, style }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let editor: monaco.editor.IStandaloneCodeEditor | null = null;

        const handleResize = () => {
            if (editor) {
                editor.layout();
            }
        };

        if (editorRef.current) {
            editor = monaco.editor.create(editorRef.current, {
                value: code,
                language: 'javascript',
                theme: 'vs-dark',
            });

            // ResizeObserver 생성
            const resizeObserver = new ResizeObserver(handleResize);

            // ResizeObserver 대상으로 editorRef.current 등록
            resizeObserver.observe(editorRef.current);

            return () => {
                if (editor) {
                    editor.dispose();
                }

                // 컴포넌트가 언마운트될 때 ResizeObserver 해제
                resizeObserver.disconnect();
            };
        }
    }, [editorRef.current, code]);

    return <div ref={editorRef} style={style} />;
};

export default MonacoEditor;