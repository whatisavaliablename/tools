import { useState } from "react";

interface FileUploaderProps {
    onFilesUpload: (files: File[]) => void;
    accept: string;
    clearFiles: boolean;
    multiple?: boolean;
}

export default function FileUploader({ onFilesUpload, accept, clearFiles, multiple = true }: FileUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);

    if (clearFiles && selectedFiles.length > 0) {
        setSelectedFiles([]);
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(false);
        startUpload(Array.from(event.dataTransfer.files));
    };

    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            startUpload(Array.from(event.target.files));
        }
    };

    const startUpload = (files: File[]) => {
        setUploading(true);
        setProgress(0);

        if (accept.includes("pdf") && files.length > 1) {
            alert("PDF to JPG 파일 변환은 하나씩만 가능합니다.");
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
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                padding: "20px",
                border: `2px dashed ${dragging ? "blue" : "#ccc"}`,
                textAlign: "center",
                cursor: "pointer",
            }}
        >
            <p>여기에 파일을 드래그하세요</p>
            <input type="file" accept={accept} multiple={multiple} onChange={handleFileInput} />

            {uploading && (
                <div>
                    <p>🔄 업로드 중... {progress}%</p>
                    <progress value={progress} max="100"></progress>
                </div>
            )}

            {selectedFiles.length > 0 && !uploading && (
                <div>
                    <h4>선택된 파일:</h4>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}