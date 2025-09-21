import React, { useMemo, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { StorageService } from "../services/storageService";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Écrivez votre contenu...",
  className = "",
}) => {
  const editorRef = useRef<ReactQuill | null>(null);
  // Supprimer l'avertissement findDOMNode en mode développement
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        if (
          typeof args[0] === "string" &&
          args[0].includes("findDOMNode is deprecated")
        ) {
          return; // Ignorer cet avertissement spécifique
        }
        originalConsoleWarn(...args);
      };

      return () => {
        console.warn = originalConsoleWarn;
      };
    }
  }, []);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: async () => {
            try {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                const validation = StorageService.validateFile(
                  file as File,
                  "image"
                );
                if (!validation.isValid) {
                  alert(validation.error || "Image invalide");
                  return;
                }
                const res = await StorageService.uploadFile(
                  file as File,
                  "image"
                );
                if (!res.success || !res.url) {
                  alert(res.error || "Échec de l'upload de l'image");
                  return;
                }
                const quill = editorRef.current?.getEditor?.();
                if (!quill) return;
                const range = quill.getSelection(true);
                quill.insertEmbed(
                  range ? range.index : 0,
                  "image",
                  res.url,
                  "user"
                );
                // Placer le curseur après l'image
                if (range) {
                  quill.setSelection(range.index + 1, 0);
                }
              };
            } catch (e) {
              console.error("Erreur handler image:", e);
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    } as const;
  }, []);

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  // Convertit les images collées en data: URI vers des fichiers uploadés puis remplace les src
  const handleChange = async (val: string) => {
    try {
      const dataUrlRegex =
        /<img[^>]+src=["'](data:image\/[a-zA-Z0-9+.-]+;base64,[^"']+)["'][^>]*>/gi;
      const matches = [...val.matchAll(dataUrlRegex)];
      if (matches.length === 0) {
        onChange(val);
        return;
      }

      let updated = val;
      for (const m of matches) {
        const dataUrl = m[1];
        // Convertir data URL en File
        const file = dataUrlToFile(dataUrl, `image_${Date.now()}.png`);
        const validation = StorageService.validateFile(
          file as unknown as File,
          "image"
        );
        if (!validation.isValid) continue;
        const res = await StorageService.uploadFile(
          file as unknown as File,
          "image"
        );
        if (res.success && res.url) {
          // Remplacer seulement cette occurrence
          updated = updated.replace(dataUrl, res.url);
        }
      }
      onChange(updated);
    } catch (e) {
      console.error("Erreur conversion images collées:", e);
      onChange(val);
    }
  };

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor .ql-toolbar {
          border: 1px solid #e2e8f0;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          background: #f8fafc;
        }
        .rich-text-editor .ql-container {
          border: 1px solid #e2e8f0;
          border-top: none;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
          line-height: 1.6;
          color: #0f172a;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: italic;
        }
        .rich-text-editor .ql-snow .ql-picker {
          color: #374151;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: #374151;
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: #374151;
        }
        .rich-text-editor .ql-snow .ql-tooltip {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .rich-text-editor .ql-snow .ql-tooltip::before {
          color: #374151;
        }
        .rich-text-editor .ql-snow .ql-tooltip input[type=text] {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          color: #374151;
        }
        .rich-text-editor .ql-snow .ql-tooltip a.ql-action::after {
          color: #10b981;
        }
        .rich-text-editor .ql-snow .ql-tooltip a.ql-remove::before {
          color: #ef4444;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        ref={editorRef}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
