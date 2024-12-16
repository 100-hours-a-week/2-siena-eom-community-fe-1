document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.edit-form');
    const profileImage = document.getElementById('profile-image');
    const profileInput = document.getElementById('profile');
    const toast = document.getElementById('toast');
    const emailElement = document.getElementById('user-email');

    let initNickname = '';
    let profilePath = '';

    // 헬퍼 텍스트와 입력 필드 매핑
    const inputs = {
        profile: {
            element: profileInput,
            helper: document.getElementById('profile-helper'),
        },
        nickname: {
            element: document.getElementById('nickname'),
            helper: document.getElementById('nickname-helper'),
        },
    };

    inputs.profile.helper.textContent = '*프로필 사진이 선택되지 않으면 기본 이미지로 설정됩니다.';
    inputs.profile.helper.style.display = 'block';

    // 로그인한 사용자 정보 로드
    const loadUserData = async () => {
        try {
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                alert('로그인이 필요합니다.');
                window.location.href = './login.html';
                return;
            }

            const response = await fetch(`http://localhost:3001/users/${userId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('API 요청 실패:', response.status, response.statusText);
                alert('사용자 정보를 불러오는데 실패했습니다.');
                return;
            }

            const userData = await response.json();
            emailElement.textContent = userData.email;
            inputs.nickname.element.value = userData.nickname;
            initNickname = userData.nickname; // 닉네임 초기값 저장
            profilePath = userData.profile;
            if (userData.profile) {
                profileImage.src = userData.profile;
            }
        } catch (error) {
            console.error('사용자 정보 로드 중 오류:', error);
        }
    };
    await loadUserData();

    // 프로필 이미지를 클릭하면 파일 선택 창을 엶
    profileImage.addEventListener('click', () => {
        profileInput.click();
    });

    profileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile', file);

            try {
                const userId = sessionStorage.getItem('userId');
                const uploadResponse = await fetch(`http://localhost:3001/users/${userId}/profile`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });

                if (!uploadResponse.ok) {
                    throw new Error('프로필 사진 업로드 실패');
                }

                const uploadResult = await uploadResponse.json();
                profilePath = uploadResult.data.filePath; // 서버에서 받은 프로필 경로
                profileImage.src = profilePath; // 미리보기 업데이트
            } catch (error) {
                console.error('프로필 업로드 중 오류:', error);
                alert('프로필 사진 업로드에 실패했습니다.');
            }
        }
    });

    // 닉네임 유효성 검사 함수
    const validateInput = async (input) => {
        const { element, helper } = input;
        helper.textContent = '';

        if (element.id === 'nickname') {
            const nicknameValue = element.value;
            if (!nicknameValue) {
                helper.textContent = '*닉네임을 입력해주세요';
            } else if (/\s/.test(nicknameValue)) {
                helper.textContent = '*띄어쓰기를 없애주세요.';
            } else if (nicknameValue.length > 10) {
                helper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
            } else if (nicknameValue !== initNickname) {
                // 중복 확인 API 호출
                const userId = sessionStorage.getItem('userId');
                try {
                    const response = await fetch(`http://localhost:3001/users/${userId}/nicknameValid?nickname=${encodeURIComponent(nicknameValue)}`, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    const result = await response.json();

                    if (response.ok && result.message === 'nickname_available') {
                        helper.textContent = '';
                    } else if (response.status === 409) {
                        helper.textContent = '*이미 사용중인 닉네임입니다.';
                    } else if (response.status === 400) {
                        helper.textContent = '*유효하지 않은 요청입니다.';
                    }
                } catch (error) {
                    console.error('닉네임 중복 확인 요청 오류:', error);
                }
            }
        }
    };

    // 수정완료 버튼 이벤트 등록
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = sessionStorage.getItem('userId');
        const nickname = inputs.nickname.element.value;
        const updatePromises = [];

        if (profilePath) {
            updatePromises.push(
                fetch(`http://localhost:3001/users/${userId}/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: profilePath }),
                    credentials: 'include',
                })
            );
        }

        // 닉네임 변경 요청
        if (nickname !== initNickname) {
            updatePromises.push(
                fetch(`http://localhost:3001/users/${userId}/nickname`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nickname }),
                    credentials: 'include',
                })
            );
        }

        try {
            const results = await Promise.all(updatePromises);

            let allSuccess = true;
            for (const response of results) {
                if (!response.ok) {
                    allSuccess = false;
                    const result = await response.json();
                    console.error('요청 실패:', result.message);
                }
            }

            if (allSuccess) {
                toast.textContent = '수정완료';
            } else {
                toast.textContent = '수정실패';
            }

            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        } catch (error) {
            console.error('변경 요청 중 오류:', error);
        }
    });

    inputs.nickname.element.addEventListener('blur', () => {
        validateInput(inputs.nickname);
    });

    // 모달 열기/닫기 및 삭제 확인
    window.showConfirmModal = () => {
        document.getElementById('confirmModal').style.display = 'flex';
    };

    window.closeModal = () => {
        document.getElementById('confirmModal').style.display = 'none';
    };

    window.confirmDeletion = async () => {
        const userId = sessionStorage.getItem('userId');

        try {
            const response = await fetch(`http://localhost:3001/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
    
            if (response.ok) {
                sessionStorage.clear();
                window.location.href = './login.html';
            } else {
                const result = await response.json();
                console.error('회원 탈퇴 실패:', result.message);
                alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('회원 탈퇴 요청 중 오류:', error);
        }
    };
});
