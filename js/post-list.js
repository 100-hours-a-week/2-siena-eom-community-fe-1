// 모든 게시글 카드에 이벤트 리스너 추가
document.querySelectorAll('.post-item').forEach((item) => {
    item.addEventListener('click', function () {
        const postId = this.getAttribute('postId'); // 게시글 ID 가져오기
        location.href = `./post-show.html?postId=${postId}`; // 상세 페이지로 이동
    });
});