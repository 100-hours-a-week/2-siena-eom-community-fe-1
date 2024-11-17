document.addEventListener("DOMContentLoaded", async () => {
    try {
      // JSON 파일 불러오기
      const response = await fetch("/data/post.json");
      const data = await response.json();
      const posts = data.posts; // 게시글 배열
  
      const postListSection = document.querySelector(".PostList");
  
      // 기존 정적 게시글 제거
      postListSection.innerHTML = "";
  
      // 게시글 동적으로 생성
      posts.forEach((post) => {
        const postItem = document.createElement("div");
        postItem.classList.add("post-item");
        postItem.setAttribute("postId", post.postId);
  
        postItem.innerHTML = `
          <div class="post-header">
            <h2 class="post-title">${post.title}</h2>
          </div>
          <div class="post-info">
            <div class="post-stats">
              <span>좋아요 ${post.likeCount}</span>
              <span>댓글 ${post.commentCount}</span>
              <span>조회수 ${post.viewCount}</span>
            </div>
            <span class="post-date">${post.postDate}</span>
          </div>
          <hr class="divider">
          <div class="post-author">
            <img src="${post.profile}" alt="프로필 사진" class="author-image">
            <span class="author-name">${post.author}</span>
          </div>
        `;
  
        // 각 게시글 항목에 클릭 이벤트 추가
        postItem.addEventListener("click", function () {
          const postId = this.getAttribute("postId"); // postId 가져오기
          location.href = `./post-show.html?postId=${postId}`; // 상세 페이지로 이동
        });
  
        // 게시글 항목을 섹션에 추가
        postListSection.appendChild(postItem);
      });
    } catch (error) {
      console.error("게시글 불러오기 중 오류:", error);
      alert("게시글을 불러오는 데 실패했습니다.");
    }
  });
  