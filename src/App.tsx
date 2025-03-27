import PdfToJpg from "./components/PdfToJpg";
import JpgToPdf from "./components/JpgToPdf";
import {useEffect} from "react";

export default function App() {

    const sendLog = async () => {
        try {
            await fetch("/backend/log.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    total: 1,
                    usepdftojpg: 0,
                    usejpgtopdf: 0,
                }),
            });
            // 세션에 로그 기록 여부 저장
            sessionStorage.setItem("logSent", "true");
        } catch (error) {
            console.error("로그 저장 실패:", error);
        }
    };

    useEffect(() => {
        // 세션 스토리지에서 이전에 기록했는지 확인
        if (!sessionStorage.getItem("logSent")) {
            sendLog();
        }
    }, []); // 빈 deps 배열을 유지하여 최초 마운트 시만 실행

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>📄 PDF ↔ JPG 변환기</h1>
            <p>PDF를 JPG로 변환하거나, 여러 장의 JPG를 PDF로 변환하세요.</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "50px", marginTop: "20px" }}>
                <div>
                    <h2>PDF → JPG 변환</h2>
                    <PdfToJpg />
                </div>
                <div>
                    <h2>JPG → PDF 변환</h2>
                    <JpgToPdf />
                </div>
            </div>
        </div>
    );
}
