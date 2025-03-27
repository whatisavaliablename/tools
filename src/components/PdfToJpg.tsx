import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import JSZip from "jszip";
import FileUploader from "./FileUploader";

export default function PdfToJpg() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [converting, setConverting] = useState(false);
    const [clearFiles, setClearFiles] = useState(false);

    // 📌 파일 업로드 핸들러
    const handleFilesUpload = async (files: File[]) => {
        if (files.length > 1) {
            alert("PDF to JPG 파일 변환은 하나씩만 가능합니다.");
            return;
        }
        setSelectedFiles(files);
        setUploadCompleted(true);
        setClearFiles(false);
    };

    // 📌 PDF → JPG 변환 핸들러
    const handleConvert = async () => {
        if (!uploadCompleted || selectedFiles.length === 0) return;
        setConverting(true);
        setUploadCompleted(false);

        const file = selectedFiles[0];
        const zip = new JSZip();

        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                try {
                    const pdfData = new Uint8Array(reader.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

                    // ✅ 모든 페이지를 JPG로 변환하는 Promise 배열 생성
                    const imagePromises = Array.from({ length: pdf.numPages }, async (_, i) => {
                        const page = await pdf.getPage(i + 1);
                        const viewport = page.getViewport({ scale: 2 });
                        const canvas = document.createElement("canvas");
                        const context = canvas.getContext("2d")!;
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({ canvasContext: context, viewport }).promise;

                        // ✅ canvas.toBlob()을 Promise로 감싸기
                        return new Promise<Blob | null>((resolve) => {
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    zip.file(`page-${i + 1}.jpg`, blob);
                                    resolve(blob);
                                } else {
                                    resolve(null);
                                }
                            }, "image/jpeg");
                        });
                    });

                    // ✅ 모든 변환이 완료될 때까지 대기
                    await Promise.all(imagePromises);

                    // ✅ ZIP 파일 생성 및 다운로드
                    const zipBlob = await zip.generateAsync({ type: "blob" });
                    const zipUrl = URL.createObjectURL(zipBlob);
                    const link = document.createElement("a");
                    link.href = zipUrl;
                    link.download = "converted_images.zip";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(zipUrl);

                    setConverting(false);
                    setClearFiles(true);

                    await fetch("/backend/log.php", {
                        method : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body : JSON.stringify({total:1,usepdftojpg:1,usejpgtopdf:0}),
                    })


                } catch (error) {
                    console.error("PDF 변환 오류:", error);
                    alert("PDF 변환 중 오류가 발생했습니다.");
                    setConverting(false);
                }
            };
        } catch (error) {
            console.error("파일 읽기 오류:", error);
            alert("파일을 읽는 중 오류가 발생했습니다.");
            setConverting(false);
        }

    };

    return (
        <div>
            <FileUploader onFilesUpload={handleFilesUpload} accept="application/pdf" clearFiles={clearFiles} multiple={false} />
            {converting && <p>🔄 변환 중...</p>}
            {uploadCompleted && !converting && <button onClick={handleConvert}>변환하기</button>}
        </div>
    );
}