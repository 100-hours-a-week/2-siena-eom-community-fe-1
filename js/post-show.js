import BASE_IP from '../config.js';

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
                postDetail.textContent = "<p>게시글을 찾을 수 없습니다.</p>";
            }
        } catch (error) {
            console.error("게시글 데이터를 불러오는 중 오류 발생:", error);
            postDetail.textContent = "<p>게시글을 불러오는 데 실패했습니다.</p>";
        }
    } else {
        postDetail.textContent = "<p>유효하지 않은 요청입니다.</p>";
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

    postDetail.textContent = "";

    const isAuthor = Number(post.author) === userId;
    const authorProfilePath = post.authorProfile
    const postImagePath = post.postImage;

    // innerHTML 안쓰게 변경 ---
    const postInfo = document.createElement("div") // 게시글 정보 컨테이너
    postInfo.classList.add("post-info");

    const postAuthor = document.createElement("div") // 작성자 프로필 사진
    postAuthor.classList.add("post-author");
    const authorImg = document.createElement("img");
    authorImg.classList.add("profile-icon2");
    authorImg.src = authorProfilePath;
    postAuthor.appendChild(authorImg);
    
    const postInfo2 = document.createElement("div"); // 게시글 정보 2 (작성자닉네임, 작성날짜)
    postInfo2.classList.add("post-info-2");

    const authorName = document.createElement("span");
    authorName.classList.add("author-name");
    authorName.textContent = post.authorNickname;

    const postDate = document.createElement("span");
    postDate.classList.add("post-date");
    postDate.textContent = post.postDate;

    postInfo2.appendChild(authorName);
    postInfo2.appendChild(postDate);

    // 수정, 삭제 버튼 (작성자만 보이도록)
    const buttons = document.createElement("div");
    buttons.classList.add("buttons");

    if (isAuthor) {
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.id = "PostEditBtn";
        editBtn.textContent = "수정";
        editBtn.onclick = () => location.href = `./post-edit.html?postId=${post.postId}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.id = "PostDeleteBtn";
        deleteBtn.textContent = "삭제";
        deleteBtn.onclick = () => showConfirmModal('post', post.postId);

        buttons.appendChild(editBtn);
        buttons.appendChild(deleteBtn);
    } else {
        buttons.style.visibility = "hidden";
        // buttons.style.height = "36px";
    }

    postInfo.appendChild(postAuthor);
    postInfo.appendChild(postInfo2);
    postInfo.appendChild(buttons);

    // 게시글 본문
    const article = document.createElement("article");
    const sectionBody = document.createElement("section");
    sectionBody.classList.add("body");

    const postHeader = document.createElement("div");
    postHeader.classList.add("post-header");

    const postTitle = document.createElement("h2");
    postTitle.classList.add("post-title");
    postTitle.textContent = post.title;

    postHeader.appendChild(postTitle);

    const divider1 = document.createElement("hr");
    divider1.classList.add("divider");

    // 게시글 이미지
    const contentImg = document.createElement("div");
    contentImg.classList.add("content-img");

    if (postImagePath) {
        const img = document.createElement("img");
        img.src = postImagePath;
        img.alt = "게시글 이미지";
        contentImg.appendChild(img);
    } else {
        const noImage = document.createElement("div");
        noImage.classList.add("no-image");
        contentImg.appendChild(noImage);
    }

    // 게시글 내용
    const content = document.createElement("article");
    content.classList.add("content");
    content.textContent = post.content;

    const divider2 = document.createElement("hr");
    divider2.classList.add("divider");

    // 게시글 통계 (좋아요, 조회수, 댓글)
    const stats = document.createElement("div");
    stats.classList.add("stats");

    const likeCount = document.createElement("div");
    likeCount.classList.add("like-count");
    likeCount.textContent = `❤️ ${post.likeCount}`;

    const viewCount = document.createElement("div");
    viewCount.classList.add("view-count");
    viewCount.textContent = `👀 ${post.view}`;

    const commentCount = document.createElement("div");
    commentCount.classList.add("comment-count");
    commentCount.textContent = `💬 ${post.commentsCount}`;

    stats.appendChild(likeCount);
    stats.appendChild(viewCount);
    stats.appendChild(commentCount);

    // 섹션에 추가
    sectionBody.appendChild(postHeader);
    sectionBody.appendChild(divider1);
    sectionBody.appendChild(contentImg);
    sectionBody.appendChild(content);
    sectionBody.appendChild(divider2);
    sectionBody.appendChild(stats);

    // 아티클에 섹션 추가
    article.appendChild(sectionBody);

    // 최종적으로 postDetail에 추가
    postDetail.appendChild(postInfo);
    postDetail.appendChild(article);

}

// 댓글 렌더링 함수
function renderComments(comments, userId, postId) {
    const commentList = document.querySelector(".comment-list");

    commentList.textContent = "";

    comments.forEach((comment) => {
        const isAuthor = String(comment.commentAuthor) === String(userId);

        const authorProfilePath = comment.authorProfile?.startsWith("http")
            ? comment.authorProfile
            : `${BASE_IP}${comment.authorProfile}`;

        // innerHTML 안쓰게 변경 ---
        const commentItem = document.createElement("div"); // 댓글 아이템 컨테이너
        commentItem.classList.add("comment-item");
        commentItem.id = `comment-${comment.commentId}`;

        const commentAuthor = document.createElement("div"); // 작성자 프로필 이미지
        commentAuthor.classList.add("comment-author");
        const authorImg = document.createElement("img");
        authorImg.classList.add("profile-icon2");
        authorImg.src = authorProfilePath;
        authorImg.alt = "작성자 프로필";
        commentAuthor.appendChild(authorImg);

        const commentItem2 = document.createElement("div"); // 댓글 정보 (작성자 닉네임, 게시날짜)
        commentItem2.classList.add("comment-item-2");

        const authorName = document.createElement("span");
        authorName.classList.add("author-name");
        authorName.textContent = comment.authorNickname || "Unknown";

        const commentDate = document.createElement("span");
        commentDate.classList.add("post-date");
        commentDate.textContent = comment.commentDate;

        commentItem2.appendChild(authorName);
        commentItem2.appendChild(commentDate);

        // 버튼 컨테이너
        const buttons = document.createElement("div");
        buttons.classList.add("buttons");

        if (isAuthor) {
            const editBtn = document.createElement("button");
            editBtn.classList.add("commentEditBtn");
            editBtn.dataset.commentId = comment.commentId;
            editBtn.textContent = "수정";

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("commentDeleteBtn");
            deleteBtn.dataset.commentId = comment.commentId;
            deleteBtn.textContent = "삭제";
            deleteBtn.onclick = () => showConfirmModal('comment', comment.commentId);

            buttons.appendChild(editBtn);
            buttons.appendChild(deleteBtn);
        } else {
            buttons.style.visibility = "hidden";
            // buttons.style.height = "36px";
        }

        // 댓글 내용 컨테이너
        const commentContent = document.createElement("div");
        commentContent.classList.add("comment-content");
        const commentText = document.createElement("p");
        commentText.textContent = comment.content;
        commentContent.appendChild(commentText);

        // 요소 조립
        commentItem.appendChild(commentAuthor);
        commentItem.appendChild(commentItem2);
        commentItem.appendChild(buttons);

        // 최종적으로 commentList에 추가
        commentList.appendChild(commentItem);
        commentList.appendChild(commentContent);
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
