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
