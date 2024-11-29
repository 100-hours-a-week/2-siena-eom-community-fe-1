document.addEventListener('DOMContentLoaded', async () => {
    const logoutLink = document.querySelector('.dropdown-menu a[href="./login.html"]');
    const headerTitle = document.getElementById("headerTitle");
    const profileIcon = document.querySelector(".profile-icon");

    try {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            console.error("로그인된 사용자 정보가 없습니다.");
            return;
        }

        // 사용자 정보 API 호출
        const response = await fetch(`http://localhost:3001/users/${userId}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("사용자 정보를 불러오는 데 실패했습니다.");
        }

        const result = await response.json();
        // console.log("서버에서 반환된 데이터:", result); // 디버깅용 로그
        if (!result || !result.profile) {
            throw new Error("API 응답 데이터가 올바르지 않습니다.");
        }

        // 프로필 경로 설정
        const profilePath = result.profile;
        profileIcon.src = profilePath;

    } catch (error) {
        console.error("프로필 이미지를 불러오는 중 오류가 발생했습니다:", error);
        profileIcon.src = "../images/default-profile.png"; // 오류 시 기본 이미지 사용
    }

    if (headerTitle) {
        headerTitle.addEventListener("click", () => {
            window.location.href = "./post-list.html";
        });
    }
    
    logoutLink.addEventListener('click', async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/users/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                alert('로그아웃 되었습니다.');
                sessionStorage.clear();
                window.location.href = './login.html';
            } else {
                const result = await response.json();
                console.error('로그아웃 실패:', result.message);
                alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('로그아웃 요청 중 오류:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
});
