// URL에서 postId 읽기
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postId'); // postId 값을 가져옴

if (postId) {
  // JSON 데이터 가져오기
  fetch('../data/post.json')
    .then((response) => response.json())
    .then((data) => {
      const post = data.posts.find((p) => p.postId === parseInt(postId)); // postId에 해당하는 게시글 찾기
      
      if (post) {
        renderPost(post); // 게시글을 화면에 렌더링
      } else {
        document.getElementById('post-detail').innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
      }
    })
    .catch((error) => {
      console.error('게시글 데이터를 불러오는 중 오류 발생:', error);
    });
} else {
  document.getElementById('post-detail').innerHTML = '<p>유효하지 않은 요청입니다.</p>';
}

// 게시글 렌더링 함수
function renderPost(post) {
  const postDetail = document.getElementById('post-detail');
  postDetail.innerHTML = `
    <div class="post-header">
            <h2 class="post-title">${post.title}</h2>
    </div>
    <div class="post-info">
        <div class="post-author">
            <img class="profile-icon2" src=${post.profile} alt="작성자 프로필" />
        </div>
        <div class="post-info-2">
            <span class="author-name">${post.author}</span>
            <span class="post-date">${post.postDate}</span>    
        </div>
        <div class="buttons">
            <button type="button" id="PostEditBtn" onclick="location.href='./post-edit.html'">수정</button>
            <button type="button" id="PostDeleteBtn" onclick="showConfirmModal('post')">삭제</button>
        </div>
    </div>

    <hr class="horizontal-rule"/>
    
    <article>
        <section class="body">
            <div class="content-img">
                <img src="${post.postImage}" alt="게시글 이미지" />
            </div>
            <article class="content">${post.content}</article>
        </section>
        <hr class="horizontal-rule"/>
        <div class="stats">
            <div class="like-count">좋아요 ${post.likeCount}</div>
            <div class="view-count">조회수 ${post.viewCount}</div>
            <div class="comment-count">댓글 ${post.commentCount}</div>
        </div>
    </article>
    `;
    
}

// 게시글 및 댓글 모달 열기
function showConfirmModal(type) {
    if (type === "post") {
        document.getElementById("confirmModalPost").style.display = "flex";
    } else if (type === "comment") {
        document.getElementById("confirmModalComment").style.display = "flex";
    }
}

// 게시글 및 댓글 모달 닫기
function closeModal() {
    document.getElementById("confirmModalPost").style.display = "none";
    document.getElementById("confirmModalComment").style.display = "none";
}

// 삭제 확인 함수
function confirmDeletion(type) {
    closeModal();
    if (type === "post") {
        console.log("게시글 삭제가 확인되었습니다.");
        // 게시글 삭제 처리 로직
        window.location.href = "./post-list.html"; // 페이지 이동
    } else if (type === "comment") {
        console.log("댓글 삭제가 확인되었습니다.");
        // 댓글 삭제 처리 로직
    }
}
