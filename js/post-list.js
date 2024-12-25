document.addEventListener("DOMContentLoaded", async () => {
  // const BASE_IP = 'http://3.39.237.226:3001';
  const BASE_IP = 'http://localhost:3001';

    try {
      const response = await fetch(`${BASE_IP}/posts`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result || !result.data || result.data.length === 0) {
        console.error("No posts found or invalid response.");
        alert("게시글이 없습니다.");
        return;
      }

      const posts = result.data;
  
      const postListSection = document.querySelector(".PostList");
  
      // 기존 정적 게시글 제거
      postListSection.innerHTML = "";
  
      // 게시글 동적으로 생성
      posts.forEach((post) => {
        const postItem = document.createElement("div");
        postItem.classList.add("post-item");
        postItem.setAttribute("postId", post.postId);

        const authorProfilePath = post.authorProfile?.startsWith("http")
            ? post.authorProfile
            : `${BASE_IP}${post.authorProfile}`;
  
        postItem.innerHTML = `
          <div class="post-header">
            <h2 class="post-title">${post.title}</h2>
          </div>
          <div class="post-info">
            <div class="post-stats">
              <span>좋아요 ${post.likeCount}</span>
              <span>댓글 ${post.commentsCount}</span>
              <span>조회수 ${post.view}</span>
            </div>
            <span class="post-date">${post.postDate}</span>
          </div>
          <hr class="divider">
          <div class="post-author">
            <img src="${authorProfilePath}" alt="프로필 사진" class="author-image">
            <span class="author-name">${post.authorNickname}</span>
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
  