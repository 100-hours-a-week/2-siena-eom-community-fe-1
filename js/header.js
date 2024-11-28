document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.querySelector('.dropdown-menu a[href="./login.html"]');
    const headerTitle = document.getElementById("headerTitle");

    if (headerTitle) {
        headerTitle.addEventListener("click", () => {
            window.location.href = "./post-list.html"; // post-list.html로 이동
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
