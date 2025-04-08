import { useState, useEffect } from "react";
import styles from "./FileUploader.module.css";

interface FileUploaderProps {
  onFilesUpload: (files: File[]) => void;
  accept: string;
  clearFiles: boolean;
  multiple?: boolean;
  isResizer: boolean;
}

export default function FileUploader({
  onFilesUpload,
  accept,
  clearFiles,
  multiple = true,
  isResizer,
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (clearFiles && selectedFiles.length > 0) {
      setSelectedFiles([]);
    }
  }, [clearFiles]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 마우스가 컴포넌트를 벗어난 경우에만 dragging 종료
    if ((e.relatedTarget as HTMLElement)?.closest(`.${styles.container}`) == null) {
      setDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    startUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      startUpload(Array.from(e.target.files));
    }
  };

  const startUpload = (files: File[]) => {
    setUploading(true);
    setProgress(0);

    if (accept.includes("pdf") && files.length > 1) {
      alert("PDF 파일 변환은 하나씩만 가능합니다.");
      setUploading(false);
      return;
    }

    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    setTimeout(() => {
      setSelectedFiles(files);
      setUploading(false);
      setProgress(100);
      onFilesUpload(files);
    }, 1500);
  };

  return (
    <div className={`${styles.wrap} ${dragging ? styles.dragging : ""}`}>
      <div
        className={styles.container}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className={styles.iconText}>
          {uploading ? (
            <>
              <br />
              UPLOADING
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </>
          ) : selectedFiles.length === 0 ? (
            <p>파일을 이곳에 드래그하세요.</p>
          ) : (
            <div className={`${styles.fileList} ${isResizer ? styles.isResize : ""}`}>
              <span>변환할 파일</span>
              {selectedFiles.map((file) => file.name).join(", ")}
            </div>
          )}
        </label>
      </div>

      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className={styles.uploadInput}
        id="fileInput"
      />

      {selectedFiles.length === 0 && (
        <label htmlFor="fileInput" className={styles.uploadButton}>
          파일 선택하기
        </label>
      )}
    </div>
  );
}
