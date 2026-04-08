'use client';

import React, { useEffect, useRef } from 'react';

interface FloatingCanvasEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    accentClassName?: string;
    autoFocus?: boolean;
}

function insertHtmlAtCursor(html: string) {
    if (typeof window === 'undefined') return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const fragment = document.createDocumentFragment();
    let node: ChildNode | null;
    let lastNode: ChildNode | null = null;

    while ((node = temp.firstChild)) {
        lastNode = fragment.appendChild(node);
    }

    range.insertNode(fragment);

    if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function placeCaretAtEnd(element: HTMLElement) {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function decorateCanvasImages(editor: HTMLElement) {
    const figures = Array.from(editor.querySelectorAll('figure.canvas-image-block'));

    figures.forEach((figure) => {
        if (!(figure instanceof HTMLElement)) return;

        const image = figure.querySelector('img');
        if (!image) return;

        if (!figure.querySelector('.canvas-image-delete')) {
            const button = document.createElement('span');
            button.className = 'canvas-image-delete';
            button.setAttribute('contenteditable', 'false');
            button.setAttribute('data-canvas-action', 'delete-image');
            button.setAttribute('role', 'button');
            button.setAttribute('tabindex', '-1');
            button.setAttribute('aria-label', 'Delete image');
            button.textContent = 'Delete';
            figure.appendChild(button);
        }
    });
}

function getEditorHtml(editor: HTMLElement) {
    const clone = editor.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return editor.innerHTML;

    clone.querySelectorAll('.canvas-image-delete').forEach((button) => button.remove());
    return clone.innerHTML;
}

function isProbablyImageUrl(value: string) {
    return /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(value);
}

async function uploadImageFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const resp = await fetch('/api/gamification/assets/upload', {
        method: 'POST',
        body: formData,
    });

    if (!resp.ok) {
        throw new Error('Image upload failed');
    }

    const data = await resp.json();
    return data.url as string;
}

function blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Failed to convert blob to data url'));
        };
        reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
        reader.readAsDataURL(blob);
    });
}

async function normalizePastedHtml(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));

    await Promise.all(
        images.map(async (img) => {
            const src = img.getAttribute('src') || '';
            img.removeAttribute('width');
            img.removeAttribute('height');
            img.removeAttribute('srcset');
            img.removeAttribute('sizes');
            img.style.width = '';
            img.style.height = '';
            img.style.maxWidth = '100%';
            img.style.objectFit = 'contain';
            img.setAttribute('referrerpolicy', 'no-referrer');
            img.setAttribute('loading', 'lazy');

            if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
                return;
            }

            if (!/^https?:\/\//i.test(src)) {
                return;
            }

            try {
                const response = await fetch(src);
                if (!response.ok) return;
                const blob = await response.blob();
                const dataUrl = await blobToDataUrl(blob);
                img.setAttribute('src', dataUrl);
            } catch {
                img.setAttribute('referrerpolicy', 'no-referrer');
            }
        })
    );

    images.forEach((img) => {
        if (img.parentElement?.tagName !== 'FIGURE') {
            const figure = doc.createElement('figure');
            figure.className = 'canvas-image-block';
            img.replaceWith(figure);
            figure.appendChild(img);
        } else {
            img.parentElement.classList.add('canvas-image-block');
        }
    });

    return doc.body.innerHTML;
}

export default function FloatingCanvasEditor({
    label,
    value,
    onChange,
    placeholder,
    accentClassName = 'text-emerald-600',
    autoFocus = false,
}: FloatingCanvasEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        if (editor.innerHTML !== value) {
            editor.innerHTML = value;
            decorateCanvasImages(editor);
        }
    }, [value]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        decorateCanvasImages(editor);

        const observer = new MutationObserver(() => {
            decorateCanvasImages(editor);
        });

        observer.observe(editor, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!autoFocus) return;
        const editor = editorRef.current;
        if (!editor) return;

        const id = window.setTimeout(() => {
            editor.focus();
        }, 60);

        return () => window.clearTimeout(id);
    }, [autoFocus]);

    const handleInput = () => {
        const editor = editorRef.current;
        if (!editor) return;
        decorateCanvasImages(editor);
        onChange(getEditorHtml(editor));
    };

    const focusEditorForInsert = () => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();

        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const selectionInsideEditor =
            !!range &&
            editor.contains(range.startContainer) &&
            editor.contains(range.endContainer);

        if (!selectionInsideEditor) {
            placeCaretAtEnd(editor);
        }
    };

    const insertImageFile = async (file: File) => {
        focusEditorForInsert();

        try {
            const url = await uploadImageFile(file);
            insertHtmlAtCursor(
                `<figure class="canvas-image-block"><img src="${url}" alt="Uploaded note" /></figure><p><br></p>`
            );
            const editor = editorRef.current;
            if (!editor) return;
            decorateCanvasImages(editor);
            onChange(getEditorHtml(editor));
        } catch {
            const reader = new FileReader();
            reader.onload = () => {
                const src = typeof reader.result === 'string' ? reader.result : '';
                if (!src) return;
                insertHtmlAtCursor(
                    `<figure class="canvas-image-block"><img src="${src}" alt="Pasted note" /></figure><p><br></p>`
                );
                const editor = editorRef.current;
                if (!editor) return;
                decorateCanvasImages(editor);
                onChange(getEditorHtml(editor));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = Array.from(event.clipboardData.items);
        const files = Array.from(event.clipboardData.files);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        const html = event.clipboardData.getData('text/html');
        const uriList = event.clipboardData.getData('text/uri-list').trim();
        const text = event.clipboardData.getData('text/plain').trim();

        if (imageFile) {
            event.preventDefault();
            void insertImageFile(imageFile);
            return;
        }

        if (imageItem) {
            event.preventDefault();
            const file = imageItem.getAsFile();
            if (!file) return;
            void insertImageFile(file);
            return;
        }

        if (html && /<img[\s\S]*?>/i.test(html)) {
            event.preventDefault();
            void normalizePastedHtml(html).then((normalizedHtml) => {
                insertHtmlAtCursor(`${normalizedHtml}<p><br></p>`);
                const editor = editorRef.current;
                if (!editor) return;
                decorateCanvasImages(editor);
                onChange(getEditorHtml(editor));
            });
            return;
        }

        const imageUrl = [uriList, text].find((value) => value && isProbablyImageUrl(value));

        if (imageUrl) {
            event.preventDefault();
            insertHtmlAtCursor(
                `<figure class="canvas-image-block"><img src="${imageUrl}" referrerpolicy="no-referrer" alt="Linked note" /></figure><p><br></p>`
            );
            const editor = editorRef.current;
            if (!editor) return;
            decorateCanvasImages(editor);
            onChange(getEditorHtml(editor));
            return;
        }

        if (uriList.startsWith('file:///') || text.startsWith('file:///')) {
            event.preventDefault();
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        focusEditorForInsert();

        const files = Array.from(event.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        if (imageFile) {
            void insertImageFile(imageFile);
            return;
        }

        const uriList = event.dataTransfer.getData('text/uri-list').trim();
        const text = event.dataTransfer.getData('text/plain').trim();
        const imageUrl = [uriList, text].find((value) => value && isProbablyImageUrl(value));

        if (imageUrl) {
            insertHtmlAtCursor(
                `<figure class="canvas-image-block"><img src="${imageUrl}" referrerpolicy="no-referrer" alt="Dropped note" /></figure><p><br></p>`
            );
            const editor = editorRef.current;
            if (!editor) return;
            decorateCanvasImages(editor);
            onChange(getEditorHtml(editor));
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const deleteButton = target.closest('[data-canvas-action="delete-image"]');
        if (!deleteButton) return;

        event.preventDefault();
        event.stopPropagation();

        const editor = editorRef.current;
        const figure = target.closest('figure.canvas-image-block');
        if (!editor || !figure) return;

        const nextParagraph = figure.nextElementSibling;
        figure.remove();

        if (nextParagraph instanceof HTMLParagraphElement && !nextParagraph.textContent?.trim()) {
            nextParagraph.remove();
        }

        decorateCanvasImages(editor);
        onChange(getEditorHtml(editor));
        focusEditorForInsert();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        void insertImageFile(file);
        event.target.value = '';
    };

    return (
        <div className="cloud-shell relative mx-auto flex h-full min-h-[22rem] w-full max-w-[58rem] flex-col">
            <div className="cloud-puff cloud-puff-a" />
            <div className="cloud-puff cloud-puff-b" />
            <div className="cloud-puff cloud-puff-c" />
            <div className="cloud-puff cloud-puff-d" />
            <div className="cloud-sheet relative flex h-full min-h-[22rem] flex-col overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(74,222,128,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.2)_26%,transparent_42%)]" />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-white/72 px-5 py-4 backdrop-blur-xl sm:px-8">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <div className={`h-2 w-2 rounded-full bg-current ${accentClassName}`} />
                        <span className="font-tactical text-[10px] uppercase tracking-[0.45em] text-slate-700">
                            {label}
                        </span>
                        <span className="font-tactical text-[10px] uppercase tracking-[0.28em] text-slate-500">
                            Type + Paste Images
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 rounded-full border border-emerald-300/60 bg-emerald-50 px-3 py-1 font-tactical text-[10px] uppercase tracking-[0.25em] text-emerald-700 transition hover:bg-emerald-100"
                    >
                        Upload Image
                    </button>
                </div>

                <div className="relative z-10 px-5 pb-4 pt-4 sm:px-8">
                    <div className="rounded-[1.5rem] border border-dashed border-emerald-300/45 bg-emerald-50/80 px-5 py-4 text-left">
                        <div className="font-tactical text-[10px] uppercase tracking-[0.45em] text-emerald-700">
                            Floating Cloud Canvas
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                            Type notes here, then paste image with <span className="font-semibold text-emerald-700">Ctrl+V</span>.
                        </div>
                    </div>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onClick={handleClick}
                    onPaste={handlePaste}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-placeholder={placeholder}
                    tabIndex={0}
                    className="canvas-editor relative z-[1] min-h-[18rem] flex-1 overflow-auto px-5 pb-8 pt-2 text-left text-slate-900 outline-none sm:px-8"
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
