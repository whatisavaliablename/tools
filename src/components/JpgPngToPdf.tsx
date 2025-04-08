import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileUploader from "./FileUploader";

export default function JpgPngToPdf() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [converting, setConverting] = useState(false);
    const [clearFiles, setClearFiles] = useState(false);

    const handleFilesUpload = async (files: File[]) => {
        const validFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png");
        });

        if (validFiles.length !== files.length) {
            alert("JPG 또는 PNG 파일만 업로드 가능합니다.");
            setClearFiles(true);
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
                total_visit: 0,
                use_pdftojpg: 0,
                use_pdftopng: 0,
                use_imgtopdf: 1,
                use_changeimg: 0,
                use_imgresizer: 0,
            }),
        }).then(res => res.json())
        .then(data => console.log("🔁 로그 응답:", data))
        .catch(err => console.error("❌ 요청 실패:", err));
    };

    return (
        <div>
            <FileUploader onFilesUpload={handleFilesUpload} accept="image/jpeg,image/png" clearFiles={clearFiles} isResizer={false}/>
            {converting && <p 
                style={{margin:"0",backgroundColor: "#0fb77e",
                color: "white",
                padding: "10px 20px",
                border : "2px solid #0fb77e",
                borderRadius: "0 0 6px 6px",
                display:"block",
                fontSize:"16px",
                height:"28px"
            }}>🔄 변환 중...</p>}
            {uploadCompleted && !converting && <button style={{backgroundColor: "#0fb77e",
                color: "white",
                padding: "9px 20px 11px",
                border : "2px solid #0fb77e",
                borderRadius: "0 0 6px 6px",
                cursor: "pointer",
                display:"block",
                width: "100%",
                height: "50px",
                fontSize:"16px"
            }} onClick={handleConvert}>변환하기</button>}
        </div>
    );
}
