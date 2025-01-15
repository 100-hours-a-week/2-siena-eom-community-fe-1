// const BASE_IP = 'http://3.39.237.226:3001';
const BASE_IP = 'http://localhost:3001';

document.addEventListener("DOMContentLoaded", async () => {
    const postDetail = document.getElementById("post-detail");
    const commentButton = document.querySelector(".gray-button");
    const commentTextarea = document.querySelector(".comment-input textarea");
    
    // URL에서 postId, commentId 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");
    let commentId = urlParams.get("commentId");

    let userId;
    try {
        const userResponse = await fetch(`${BASE_IP}/users/userId`, {
            method: "GET",
            credentials: "include",
        });

        if (!userResponse.ok) {
            throw new Error("사용자 정보를 가져오지 못했습니다.");
        }

        const result = await userResponse.json();
        userId = result.data.userId;
        if (!userId) {
            alert('로그인이 필요합니다.');
            window.location.href = './login.html';
            return;
        }
    } catch (error) {
        console.error("사용자 정보를 가져오는 중 오류 발생:", error);
        alert('로그인이 필요합니다.');
        window.location.href = './login.html';
        return;
    }
    
    // 게시글 데이터 불러오기
    if (postId) {
        try {
            await increaseView(postId);

            const response = await fetch(`${BASE_IP}/posts/${postId}`, {
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

    // 댓글 작성 및 수정 이벤트
    commentButton.addEventListener("click", async () => {
        const commentContent = commentTextarea.value.trim();
        const commentId = commentButton.getAttribute("data-comment-id"); // 버튼에 저장된 댓글 ID 가져오기
        if (!commentContent) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        const url = commentId
            ? `${BASE_IP}/posts/${postId}/comments/${commentId}`
            : `${BASE_IP}/posts/${postId}/comments`;

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
                await loadComments(postId, userId);
                commentTextarea.value = "";
                commentButton.textContent = "댓글 작성";
                commentButton.removeAttribute("data-comment-id"); // 댓글 ID 초기화

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

});

// 조회수 증가 API 호출 함수
async function increaseView(postId) {
    try {
        const response = await fetch(`${BASE_IP}/posts/${postId}/viewCount`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            console.error("조회수 증가 실패:", response.statusText);
        }
    } catch (error) {
        console.error("조회수 증가 요청 중 오류:", error);
    }
}

// 게시글 렌더링 함수
function renderPost(post, userId) {
    const postDetail = document.getElementById("post-detail");

    const isAuthor = Number(post.author) === userId;
    const authorProfilePath = post.authorProfile
    const postImagePath = post.postImage;

    postDetail.innerHTML = `
        
        <div class="post-info">
            <div class="post-author">
                <img class="profile-icon2" src="${authorProfilePath}" alt="작성자 프로필" />
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

        <article>
            <section class="body">
                <div class="post-header">
                    <h2 class="post-title">${post.title}</h2>
                </div>
                <hr class="divider">
                <div class="content-img">
                ${
                    postImagePath
                        ? `<img src="${postImagePath}" alt="게시글 이미지" />`
                        : `<div class="no-image"></div>`
                }
                </div>
                <article class="content">${post.content}</article>
                <hr class="divider">
                <div class="stats">
                    <div class="like-count">❤️ ${post.likeCount}</div>
                    <div class="view-count">👀 ${post.view}</div>
                    <div class="comment-count">💬 ${post.commentsCount}</div>
                </div>
            </section>
        </article>
    `;
}

// 댓글 렌더링 함수
function renderComments(comments, userId, postId) {
    const commentList = document.querySelector(".comment-list");

    commentList.innerHTML = "";

    comments.forEach((comment) => {
        const isAuthor = String(comment.commentAuthor) === String(userId);

        const authorProfilePath = comment.authorProfile?.startsWith("http")
            ? comment.authorProfile
            : `${BASE_IP}${comment.authorProfile}`;

        const commentItem = `
            <div class="comment-item" id="comment-${comment.commentId}">
                <div class="comment-author">
                    <img class="profile-icon2" src="${authorProfilePath || "../images/default-profile.png"}" alt="작성자 프로필">
                </div>
                <div class="comment-item-2">
                    <span class="author-name">${comment.authorNickname || "Unknown"}</span>
                    <span class="post-date">${comment.commentDate}</span>    
                </div>
                <div class="buttons">
                    ${
                        isAuthor
                            ? `<button class="commentEditBtn" data-comment-id="${comment.commentId}">수정</button>
                               <button class="commentDeleteBtn" data-comment-id="${comment.commentId}" onclick="showConfirmModal('comment', ${comment.commentId})">삭제</button>`
                            : '<div style="visibility: hidden; height: 36px;"></div>'
                    }
                </div>
            </div>
            <div class="comment-content">
                <p>${comment.content}</p>
            </div>
        `;
        commentList.insertAdjacentHTML("beforeend", commentItem);
    });
    
    // 댓글 수정 이벤트 바인딩
    document.querySelectorAll(".commentEditBtn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const commentId = event.target.getAttribute("data-comment-id");
            const comment = comments.find((c) => String(c.commentId) === String(commentId));

            if (comment) {
                const commentTextarea = document.querySelector(".comment-input textarea");
                const commentButton = document.querySelector(".gray-button");

                commentTextarea.value = comment.content; // 댓글 내용을 입력란에 채우기
                commentButton.textContent = "댓글 수정"; // 버튼 텍스트 변경
                commentButton.setAttribute("data-comment-id", commentId); // 댓글 ID 저장
            }
        });
    });

    // 댓글 삭제 이벤트 바인딩
    document.querySelectorAll(".commentDeleteBtn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const commentId = event.target.getAttribute("data-comment-id");
            showConfirmModal("comment", commentId, userId);
        });
    });
}

// 댓글 목록 로드 함수
async function loadComments(postId, userId) {
    const commentCount = document.querySelector(".comment-count");

    // 서버에서 댓글 상태 동기화
    const updateCommentsCount = async () => {
        try {
            const response = await fetch(`${BASE_IP}/posts/${postId}`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const result = await response.json();
                commentCount.textContent = `💬 ${result.data.commentsCount}`;
            } else {
                console.error("댓글 상태 동기화 실패");
            }
        } catch (error) {
            console.error("댓글 상태 동기화 중 오류:", error);
        }
    };

    updateCommentsCount();

    try {
        const response = await fetch(`${BASE_IP}/posts/${postId}/comments`, {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            const result = await response.json();
            renderComments(result.data, userId, postId);
        } else {
            console.error("댓글 로드 실패:", await response.text());
        }
    } catch (error) {
        console.error("댓글 로드 중 오류 발생:", error);
    }
}

// 삭제 모달
function showConfirmModal(type, id, userId) {
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
            await handleCommentDelete(id, userId);
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
        const response = await fetch(`${BASE_IP}/posts/${postId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (response.ok) {
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
async function handleCommentDelete(commentId, userId) {
    const postId = new URLSearchParams(window.location.search).get("postId");

    try {
        const response = await fetch(`${BASE_IP}/posts/${postId}/comments/${commentId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (response.ok) {
            await loadComments(postId,userId);
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

    userId = Number(userId);

     // 서버에서 좋아요 상태 동기화
     const updateButtonState = async () => {
        try {
            const response = await fetch(`${BASE_IP}/posts/${post.postId}`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const result = await response.json();
                const likes = result.data.likes || [];
                const isLiked = likes.includes(userId);
                const likeCount = result.data.likeCount;

                likeButton.textContent = `❤️ ${likeCount}`;
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

            const url = `${BASE_IP}/posts/${post.postId}/likes/${userId}`;
            const method = isLiked ? "DELETE" : "POST";

            const response = await fetch(url, {
                method: method,
                credentials: "include",
            });

            if (response.ok) {
                const result = await response.json();
                const likeCount = result.data;
                likeButton.textContent = `❤️ ${likeCount}`;
                likeButton.classList.toggle("liked", !isLiked); // 상태 반전
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