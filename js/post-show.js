document.addEventListener("DOMContentLoaded", async () => {
    const postDetail = document.getElementById("post-detail");
    const userId = sessionStorage.getItem("userId");
    const commentButton = document.querySelector(".purple-button");
    const commentTextarea = document.querySelector(".comment-input textarea");

    // URL에서 postId, commentId 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");
    const commentId = urlParams.get("commentId");

    if (commentId) {
        // 댓글 수정 모드: 기존 데이터 로드
        try {
            const response = await fetch(
                `http://localhost:3001/posts/${postId}/comments/${commentId}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const comment = result.data;

            // 댓글 내용 채우기
            commentTextarea.value = comment.content;
            // 버튼 텍스트 변경
            commentButton.textContent = "댓글 수정";
        } catch (error) {
            console.error("댓글 데이터를 불러오는 중 오류 발생:", error);
            alert("댓글 데이터를 불러오지 못했습니다.");
        }
    }

    // 댓글 작성 및 수정 이벤트
    commentButton.addEventListener("click", async () => {
        const commentContent = commentTextarea.value.trim();

        if (!commentContent) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        const url = commentId
            ? `http://localhost:3001/posts/${postId}/comments/${commentId}`
            : `http://localhost:3001/posts/${postId}/comments`;

        const method = commentId ? "PATCH" : "POST"; // 수정이면 PATCH, 작성이면 POST

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ content: commentContent }),
            });

            if (response.ok) {
                alert(commentId ? "댓글이 수정되었습니다." : "댓글이 작성되었습니다.");
                window.location.href = `./post-show.html?postId=${postId}`; // 댓글 작성/수정 완료 후 게시글로 이동
            } else {
                const errorResult = await response.json();
                console.error(
                    commentId ? "댓글 수정 실패:" : "댓글 작성 실패:",
                    errorResult
                );
                alert("작업에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("작업 중 오류 발생:", error);
            alert("작업 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });

    // 게시글 데이터 불러오기
    if (postId) {
        try {
            const response = await fetch(`http://localhost:3001/posts/${postId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result && result.data) {
                renderPost(result.data, userId); // 게시글 렌더링
                renderComments(result.data.comments, userId, postId); // 댓글 렌더링
                bindLikeButton(result.data, userId); // 좋아요 버튼 이벤트 바인딩
               
            } else {
                postDetail.innerHTML = "<p>게시글을 찾을 수 없습니다.</p>";
            }
        } catch (error) {
            console.error("게시글 데이터를 불러오는 중 오류 발생:", error);
            postDetail.innerHTML = "<p>게시글을 불러오는 데 실패했습니다.</p>";
        }
    } else {
        postDetail.innerHTML = "<p>유효하지 않은 요청입니다.</p>";
    }
});

// 게시글 렌더링 함수
function renderPost(post, userId) {
    const postDetail = document.getElementById("post-detail");

    const isAuthor = String(post.author) === userId;

    postDetail.innerHTML = `
        <div class="post-header">
            <h2 class="post-title">${post.title}</h2>
        </div>
        <div class="post-info">
            <div class="post-author">
                <img class="profile-icon2" src="${post.authorProfile}" alt="작성자 프로필" />
            </div>
            <div class="post-info-2">
                <span class="author-name">${post.authorNickname}</span>
                <span class="post-date">${post.postDate}</span>    
            </div>
            <div class="buttons">
                ${
                    isAuthor
                        ? `<button type="button" id="PostEditBtn" onclick="location.href='./post-edit.html?postId=${post.postId}'">수정</button>
                           <button type="button" id="PostDeleteBtn" onclick="showConfirmModal('post', ${post.postId})">삭제</button>`
                        : '<div style="visibility: hidden; height: 36px;"></div>'
                }
            </div>
        </div>

        <hr class="horizontal-rule"/>
        
        <article>
            <section class="body">
                <div class="content-img">
                ${
                    post.postImage
                        ? `<img src="${post.postImage}" alt="게시글 이미지" />`
                        : `<div class="no-image">첨부된 이미지가 없습니다. (;＾◇＾;)ゝ</div>`
                }
                </div>
                <article class="content">${post.content}</article>
            </section>
            <hr class="horizontal-rule"/>
            <div class="stats">
                <div class="like-count">좋아요 ${post.like}</div>
                <div class="view-count">조회수 ${post.view}</div>
                <div class="comment-count">댓글 ${post.commentsCount}</div>
            </div>
        </article>
    `;
}

// 댓글 렌더링 함수
function renderComments(comments, userId, postId) {
    const commentList = document.querySelector(".comment-list");

    commentList.innerHTML = "";

    comments.forEach((comment) => {
        const isAuthor = String(comment.commentAuthor) === String(userId);

        const commentItem = `
            <div class="comment-item" id="comment-${comment.commentId}">
                <div class="comment-author">
                    <img class="profile-icon2" src="${comment.authorProfile || "../images/default-profile.png"}" alt="작성자 프로필">
                </div>
                <div class="comment-item-2">
                    <span class="author-name">${comment.authorNickname || "Unknown"}</span>
                    <span class="post-date">${comment.commentDate}</span>    
                </div>
                <div class="buttons">
                    ${
                        isAuthor
                            ? `<button onclick="location.href='./post-show.html?postId=${postId}&commentId=${comment.commentId}'">수정</button>
                               <button class="commentDeleteBtn" data-comment-id="${comment.commentId}" onclick="showConfirmModal('comment', ${comment.commentId})">삭제</button>`
                            : '<div style="visibility: hidden; height: 36px;"></div>'
                    }
                </div>
            </div>
            <div class="comment-content">
                <p>${comment.commentContent}</p>
            </div>
        `;
        commentList.insertAdjacentHTML("beforeend", commentItem);
    });

    // 댓글 삭제 이벤트 바인딩
    document.querySelectorAll(".commentDeleteBtn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const commentId = event.target.getAttribute("data-comment-id");
            showConfirmModal("comment", commentId);
        });
    });
}

// 삭제 모달
function showConfirmModal(type, id) {
    const modal = type === "post" ? document.getElementById("confirmModalPost") : document.getElementById("confirmModalComment");

    modal.style.display = "flex";

    const confirmButton = modal.querySelector(".modal-confirm");
    const cancelButton = modal.querySelector(".modal-cancel");

    confirmButton.onclick = null;
    cancelButton.onclick = null;

    confirmButton.onclick = async () => {
        modal.style.display = "none";
        if (type === "post") {
            await handlePostDelete(id);
        } else if (type === "comment") {
            await handleCommentDelete(id);
        }
    };

    cancelButton.onclick = () => {
        modal.style.display = "none";
    };
}

// 게시글 삭제 처리
async function handlePostDelete(postId) {
    if (!postId) {
        alert("게시글 ID가 유효하지 않습니다.");
        return;
    }
    try {
        const response = await fetch(`http://localhost:3001/posts/${postId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (response.ok) {
            alert("게시글이 삭제되었습니다.");
            window.location.href = "./post-list.html";
        } else {
            const errorResult = await response.json();
            alert("게시글 삭제 실패");
            console.error("게시글 삭제 오류:", errorResult);
        }
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
    }
}

// 댓글 삭제 처리
async function handleCommentDelete(commentId) {
    const postId = new URLSearchParams(window.location.search).get("postId");

    try {
        const response = await fetch(`http://localhost:3001/posts/${postId}/comments/${commentId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (response.ok) {
            alert("댓글이 삭제되었습니다.");
            window.location.reload();
        } else {
            const errorResult = await response.json();
            alert("댓글 삭제 실패");
            console.error("게시글 삭제 오류:", errorResult);
        }
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
    }
}

// 좋아요 버튼 이벤트 바인딩 함수
function bindLikeButton(post, userId) {
    const likeButton = document.querySelector(".like-count");
    if (!likeButton) {
        console.error("좋아요 버튼을 찾을 수 없습니다.");
        return;
    }

    userId = Number(userId);

     // 서버에서 좋아요 상태 동기화
     const updateButtonState = async () => {
        try {
            const response = await fetch(`http://localhost:3001/posts/${post.postId}`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const result = await response.json();
                console.log("서버로부터 받은 데이터:", result); // 디버깅용
                const isLiked = result.data.likes.includes(userId);
                console.log(`사용자 ${userId}의 좋아요 상태:`, isLiked); // 디버깅용
                likeButton.textContent = `좋아요 ${result.data.like}`;
                likeButton.classList.toggle("liked", isLiked); // 동기화된 상태로 업데이트
            } else {
                console.error("좋아요 상태 동기화 실패");
            }
        } catch (error) {
            console.error("좋아요 상태 동기화 중 오류:", error);
        }
    };

    updateButtonState();

    // 좋아요 버튼 클릭 이벤트
    likeButton.addEventListener("click", async () => {
        try {
            const isLiked = likeButton.classList.contains("liked");
            console.log(`현재 좋아요 상태: ${isLiked}`); //디버깅용
            const url = `http://localhost:3001/posts/${post.postId}/likes/${userId}`;
            const method = isLiked ? "DELETE" : "POST";
            console.log(`보낼 요청: ${method} ${url}`);

            const response = await fetch(url, {
                method: method,
                credentials: "include",
            });

            if (response.ok) {
                const result = await response.json();
                console.log("서버 응답 데이터:", result);
                likeButton.textContent = `좋아요 ${result.data.like}`;
                likeButton.classList.toggle("liked", !isLiked); // 상태 반전
                alert(isLiked ? "좋아요가 취소되었습니다." : "좋아요를 추가했습니다.");
                window.location.reload();
            } else {
                const errorResult = await response.json();
                console.error("좋아요 처리 중 오류:", errorResult);
                alert(errorResult.message);
            }
        } catch (error) {
            console.error("좋아요 처리 중 오류:", error);
        }
    });
}