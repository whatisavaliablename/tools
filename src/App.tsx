import PdfToJpg from "./components/PdfToJpg";
import PdfToPng from "./components/PdfToPng";
import JpgPngToPdf from "./components/JpgPngToPdf";
import ChangeImg from "./components/ChangeImg";
import ImgResizer from "./components/ImgResizer";
import FeedbackBoard from "./components/FeedbackBoard";
import Header from "./components/Header";
import styles from "./App.module.css"


import {useEffect} from "react";

export default function App() {

    const sendLog = async () => {
        try {
            await fetch("/backend/log.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    total_visit: 1,
                    use_pdftojpg: 0,
                    use_pdftopng: 0,
                    use_imgtopdf: 0,
                    use_changeimg: 0,
                    use_imgresizer: 0,
                }),
            }).then(res => res.json())
            .then(data => console.log("🔁 로그 응답:", data))
            .catch(err => console.error("❌ 요청 실패:", err));
            
            sessionStorage.setItem("logSent", "true");
        } catch (error) {
            console.error("로그 저장 실패:", error);
        }
    };
    
    useEffect(() => {
        if (!sessionStorage.getItem("logSent")) {
            sendLog();
        }
    }, []);
    

    return (
        <>
        <Header/>
            <div className={styles.main} id="document-tools">

                <div className={styles.title}>
                    <span>정보유출</span> 걱정없이<br/>
                    <span>안전하고 편하게</span> 편환하세요!
                </div>

                <div className={styles.components}>
                    <div className={styles.component}>
                        <h3>PDF → JPG 변환</h3>
                        <PdfToJpg />
                    </div>
                    <div className={styles.component}>
                        <h3>PDF → PNG 변환</h3>
                        <PdfToPng />
                    </div>
                    <div className={styles.component}>
                        <h3>이미지<span style={{fontSize:"12px"}}>(jpg,png)</span> → PDF변환</h3>
                        <JpgPngToPdf />
                    </div>
                </div>
                <div className={styles.components}>
                    <div className={styles.component}>
                        <h3>이미지 확장자<span style={{fontSize:"12px"}}>(jpg ↔ png)</span> 변환</h3>
                        <ChangeImg />
                    </div>
                    <div className={styles.component}>
                        <h3>이미지 사이즈 조정 <span style={{fontSize:"12px"}}>(jpg, png)</span></h3>
                        <ImgResizer />
                    </div>
                    <div className={styles.component} style={{visibility:"hidden"}}>
                        레이아웃 사이즈 조정용 임시 컴포넌트
                    </div>
                </div>
            </div>

            <div id="feedback-board">
                <FeedbackBoard />
            </div>
        </>
    );
}
