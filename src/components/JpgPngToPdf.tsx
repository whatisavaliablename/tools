import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileUploader from "./FileUploader";

export default function JpgPngToPdf() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [clearFiles, setClearFiles] = useState(false);

    const handleFilesUpload = async (files: File[]) => {
        const validFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png");
        });

        if (validFiles.length !== files.length) {
            alert("JPG 또는 PNG 파일만 업로드 가능합니다.");
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
            const file = selectedFiles[i];
            const ext = file.name.toLowerCase();
            const fileData = await file.arrayBuffer();

            let img;
            if (ext.endsWith(".png")) {
                img = await pdfDoc.embedPng(fileData);
            } else {
                img = await pdfDoc.embedJpg(fileData);
            }

            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

            setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "converted.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setConverting(false);
        setClearFiles(true);

        // ✅ 로그 전송
        await fetch("/backend/log.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                total: 1,
                useimgtopdf: 1
            }),
        });
    };

    return (
        <div>
            <FileUploader onFilesUpload={handleFilesUpload} accept="image/jpeg,image/png" clearFiles={clearFiles} />
            {converting && <progress value={progress} max="100"></progress>}
            {uploadCompleted && !converting && <button onClick={handleConvert}>변환하기</button>}
        </div>
    );
}
