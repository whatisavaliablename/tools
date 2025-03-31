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
  const [showForm, setShowForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // 처음에 10개만

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/backend/feedback.php");
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data); // 최대 100개만 서버에서 전달
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
        setShowForm(false);
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
        setDeletingId(null);
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
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, votes: Number(f.votes) + 1 } : f
          )
        );
        sessionStorage.setItem(votedKey, "1");
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
        <span style={{ fontSize: "15px" }}>(최근 100개 게시물만 보여집니다)</span>
      </h3>

      <button
        className={`${styles.toggleBtn} ${showForm ? styles.active : ""}`}
        onClick={() => setShowForm(prev => !prev)}
      >
        <span className={styles.icon}>+</span>
      </button>

      {showForm && (
        <div className={styles.newRow}>
          <input
            maxLength={10}
            placeholder="작성자"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
          />
          <input
            maxLength={50}
            placeholder="내용"
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
          <button onClick={handleAdd}>등록</button>
        </div>
      )}

      <div className={styles.list}>
        {feedbacks.slice(0, visibleCount).map((item) => (
          <div
            key={item.id}
            className={styles.row}
            onMouseEnter={() => setDeletingId(item.id)}
            onMouseLeave={() => setDeletingId(null)}
          >
            <div className={styles.left}>
              <strong>{item.author}</strong>: {item.message}
              <span className={styles.date}>({item.created_at.split(" ")[0]})</span>
            </div>
            <div className={styles.right}>
              <button onClick={() => handleVote(item.id)}>
                👍 {item.votes}
              </button>
              {deletingId === item.id && (
                <div className={styles.deleteBox}>
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    autoComplete="off"
                    name="not-password"
                  />
                  <button onClick={() => handleDelete(item.id)}>삭제</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ➕ 더보기 버튼 */}
        {visibleCount < feedbacks.length && (
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button onClick={handleLoadMore}>＋ 더보기</button>
          </div>
        )}

        {/* ✅ 최대 100개 표시 안내 */}
        {feedbacks.length >= 100 && visibleCount >= 100 && (
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "13px", color: "#666" }}>
            최대 100개까지만 보여집니다
          </div>
        )}
      </div>
    </div>
  );
}
