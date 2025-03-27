import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ES 모듈 환경에서도 `__dirname`을 사용할 수 있도록 변환
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 로그 파일을 web/distlogs/에 저장
const LOG_DIR = path.join(__dirname, "../../distlogs");

// ✅ logs 폴더가 없으면 자동 생성
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ✅ 오늘 날짜 기반 로그 파일명 생성
const getLogFileName = () => {
    const today = new Date().toISOString().split("T")[0];
    return path.join(LOG_DIR, `${today}.txt`);
};

// ✅ 현재 시간 가져오기 (YYYY-MM-DD HH:mm:ss)
const getCurrentTime = () => {
    return new Date().toISOString().replace("T", " ").split(".")[0];
};

// ✅ 로그 파일 업데이트 (브라우저 세션 기준 total 증가)
export const updateLog = (action: "total" | "usepdftojpg" | "usejpgtopdf") => {
    const logFile = getLogFileName();
    let total = 0, usepdftojpg = 0, usejpgtopdf = 0;

    // ✅ 기존 로그 파일 읽기
    if (fs.existsSync(logFile)) {
        const logLines = fs.readFileSync(logFile, "utf8").trim().split("\n");
        const lastLog = logLines[logLines.length - 1];
        const match = lastLog.match(/total:(\d+)\/usepdftojpg:(\d+)\/usejpgtopdf:(\d+)/);
        if (match) {
            total = parseInt(match[1], 10);
            usepdftojpg = parseInt(match[2], 10);
            usejpgtopdf = parseInt(match[3], 10);
        }
    }

    // ✅ 로그 값 업데이트
    if (action === "total") total++;
    if (action === "usepdftojpg") usepdftojpg++;
    if (action === "usejpgtopdf") usejpgtopdf++;

    // ✅ 새 로그 기록 추가
    const logEntry = `${getCurrentTime()}/total:${total}/usepdftojpg:${usepdftojpg}/usejpgtopdf:${usejpgtopdf}`;
    fs.appendFileSync(logFile, logEntry + "\n");
};