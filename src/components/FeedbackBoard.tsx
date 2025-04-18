import { useEffect, useState } from "react";
import styles from "./FeedbackBoard.module.css";

interface Feedback {
  id: number;
  author: string;
  message: string;
  created_at: string;
  votes: number;
}

export default function FeedbackBoard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newAuthor, setNewAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletedId, setDeletedId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [likedIds, setLikedIds] = useState<number[]>([]); // 하트 상태
  const [visibleCount, setVisibleCount] = useState(10); // 처음에 10개만
  const [totalCount, setTotalCount] = useState(0); 
  

  const handleDeleteClick = (id: number) => {
    if (deletedId === id) {
      setDeletedId(null);
      setDeletePassword(""); // 비밀번호 입력값 초기화
    } else {
      setDeletedId(id);
      setDeletePassword(""); // 새로 열릴 때도 초기화
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/backend/feedback.php");
      const data = await res.json();
      console.log("📦 응답", data);
      if (data.success) {
        setFeedbacks(data.data);       // 최근 100개만
        setTotalCount(data.total);     // 전체 개수
      }
    } catch (e) {
      console.error("불러오기 실패", e);
    }
  };

  const handleAdd = async () => {
    if (!newAuthor || !newMessage || !newPassword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/backend/feedback.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: newAuthor,
          message: newMessage,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewAuthor("");
        setNewMessage("");
        setNewPassword("");
        fetchFeedbacks();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error("작성 실패", e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/backend/feedback.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: deletePassword }),
      });
      const data = await res.json();
      if (data.success) {
        setDeletePassword("");
        fetchFeedbacks();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error("삭제 실패", e);
    }
  };

  const handleVote = async (id: number) => {
    const votedKey = `voted_${id}`;
    if (sessionStorage.getItem(votedKey)) {
      alert("이미 추천하셨습니다.");
      return;
    }
  
    try {
      const res = await fetch("/backend/feedback.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(prev =>
          prev.map(f => f.id === id ? { ...f, votes: Number(f.votes) + 1 } : f)
        );
        sessionStorage.setItem(votedKey, "1");
        setLikedIds(prev => [...prev, id]); // 하트 클릭 기록
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error("추천 실패", e);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, feedbacks.length));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className={styles.container}>
      <h3>
        남기고 싶은 의견이 있으신가요?
        <p>
          지금까지 보내주신 의견<span className={styles.count}>{`총 ${totalCount}개`}</span>
        </p>
      </h3>

      <div className={styles.newRow}>
        <input
          maxLength={8}
          placeholder="이름"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
        />
        <input
          maxLength={50}
          placeholder="소중한 의견은 개발자에게 큰 힘이됩니다."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="off"
          name="not-password"
        />
        <button onClick={handleAdd}>글쓰기</button>
      </div>

      <div className={styles.list}>
      {feedbacks.slice(0, visibleCount).map((item) => (
        <div key={item.id}>
          <div className={styles.row}>
            <div className={styles.left}>
              <strong className={styles.name}>{item.author}</strong>
              <span className={styles.message}>{item.message}</span>
            </div>

            <div className={styles.right}>
              <span className={styles.date}>{item.created_at.split(" ")[0]}</span>
              <div
                className={`${styles.like} ${likedIds.includes(item.id) ? styles.liked : ""}`}
                onClick={() => handleVote(item.id)}
              />
              <span>{item.votes}</span>
              <a onClick={() => handleDeleteClick(item.id)}>삭제</a>
            </div>
          </div>

          {deletedId === item.id && (
            <div className={styles.deleteBox}>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="off"
                name="not-password"
              />
              <span onClick={() => handleDelete(item.id)}>확인</span>
            </div>
          )}
        </div>
      ))}

        {visibleCount < feedbacks.length && (
          <div className={styles.seeMore}>
            <div onClick={handleLoadMore}> 더보기</div>
          </div>
        )}

        {feedbacks.length >= 100 && visibleCount >= 100 && (
          <div className={styles.hundred}>
            최근 100개의 게시글만 노출됩니다
          </div>
        )}
      </div>
    </div>
  );
}
