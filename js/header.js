import BASE_IP from '../config.js';
function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = './post-list.html'; // 기본 이동 경로
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const logoutLink = document.querySelector('.dropdown-menu a[href="./login.html"]');
    const headerTitle = document.getElementById("headerTitle");
    const profileIcon = document.querySelector(".profile-icon");

    try {
        // 사용자 정보 API 호출 (세션 기반)
        const response = await fetch(`${BASE_IP}/users/userId`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("사용자 정보를 불러오는 데 실패했습니다.");
        }

        const result = await response.json();
        if (!result || !result.data.profile) {
            throw new Error("API 응답 데이터가 올바르지 않습니다.");
        }
        
        // 프로필 이미지 설정
        profileIcon.src = result.data.profile;

    } catch (error) {
        console.error("프로필 이미지를 불러오는 중 오류가 발생했습니다:", error);
        profileIcon.src = "../images/default-profile.png"; // 오류 시 기본 이미지 사용

        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault();
            alert('로그인되어 있지 않습니다. 로그인 페이지로 이동합니다.');
            window.location.href = './login.html';
        });
    }

    if (headerTitle) {
        headerTitle.addEventListener("click", () => {
            window.location.href = "./post-list.html";
        });
    }
    
    logoutLink.addEventListener('click', async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${BASE_IP}/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.status === 200) {
                alert('로그아웃 되었습니다.');
                window.location.href = './login.html';
            } else {
                const result = await response.json();
                console.error('로그아웃 실패:', result.message);
                //alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('로그아웃 요청 중 오류:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    })
});
