import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileUploader from "./FileUploader";

export default function JpgToPdf() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [clearFiles, setClearFiles] = useState(false);

    // 📌 파일 업로드 핸들러 (확장자 체크 추가)
    const handleFilesUpload = async (files: File[]) => {
        const validFiles = files.filter(file =>
            file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")
        );

        if (validFiles.length !== files.length) {
            alert("변환은 JPG 파일만 가능합니다.");
            return;
        }

        setSelectedFiles(validFiles);
        setUploadCompleted(true);
        setClearFiles(false);
    };

    const handleConvert = async () => {
        if (!uploadCompleted || selectedFiles.length === 0) return;
        setConverting(true);
        setUploadCompleted(false);
        setProgress(0);

        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < selectedFiles.length; i++) {
            setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));

            const fileData = await selectedFiles[i].arrayBuffer();
            const img = await pdfDoc.embedJpg(fileData);
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "merged.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        
        setConverting(false);
        setClearFiles(true);

        await fetch("/backend/log.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: 1, usepdftojpg: 0, usejpgtopdf: 1 }),
    });
    };

    return (
        <div>
            <FileUploader onFilesUpload={handleFilesUpload} accept="image/jpeg" clearFiles={clearFiles} />
            
            {converting && <progress value={progress} max="100"></progress>}
            
            {uploadCompleted && !converting && <button onClick={handleConvert}>변환하기</button>}
        </div>
    );
}