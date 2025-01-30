import BASE_IP from '../config.js';
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.change-form');
    const submitButton = document.querySelector('.purple-button');
    const toast = document.getElementById('toast');

    // 입력 필드와 헬퍼 텍스트 매핑
    const inputs = {
        pw: {
            element: document.getElementById('pw'),
            helper: document.getElementById('pw-helper')
        },
        pwck: {
            element: document.getElementById('pwck'),
            helper: document.getElementById('pwck-helper')
        }
    };

    let userId;
    // 로그인한 사용자 정보 로드
    const loadUserData = async () => {
        try {
            const response = await fetch(`${BASE_IP}/users/userId`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('API 요청 실패:', response.status, response.statusText);
                alert('사용자 정보를 불러오는데 실패했습니다.');
                return;
            }

            const result = await response.json();
            if (!result.data.userId) {
                alert('로그인이 필요합니다.');
                window.location.href = './login.html';
                return;
            }
            userId = result.data.userId;

        } catch (error) {
            console.error('사용자 정보 로드 중 오류:', error);
        }
    };
    await loadUserData();

  
    // 유효성 검사 함수
    function validateInput(input) {
        const { element, helper } = input;
        helper.textContent = '';

        const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
        if (element.id === 'pw') {
            const pwValue = element.value;
            if (!pwValue) {
                helper.textContent = '*비밀번호를 입력해주세요';
            } else if (!passwordCriteria.test(pwValue)) {
                helper.textContent = '*비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            }
        }
  
        if (element.id === 'pwck') {
            const pwValue = inputs.pw.element.value;
            const pwckValue = element.value;
            if (!pwckValue) {
                helper.textContent = '*비밀번호를 한번 더 입력해주세요.';
            } else if (pwValue && pwckValue && pwValue !== pwckValue) {
                helper.textContent = '*비밀번호가 일치하지 않습니다.';
            }
        }
    }

    // 폼 유효성 검사 함수
    function checkForm() {
        let isFormValid = true;
        for (const input of Object.values(inputs)) {
            validateInput(input);
            if (input.helper.textContent !== '') {
                isFormValid = false;
            }
        }
        submitButton.disabled = !isFormValid;
    }

    // 각 입력 필드에 이벤트 리스너 추가
    for (const input of Object.values(inputs)) {
        input.element.addEventListener('input', () => {
            validateInput(input);
            checkForm();
        });
    }

    // 폼 제출 시 유효성 검사 수행
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        let isValid = true;

        for (const input of Object.values(inputs)) {
            validateInput(input);
            if (input.helper.textContent !== '') {
                isValid = false;
            }
        }

        if (isValid) {
            try{
                const newPassword = inputs.pw.element.value;

                const response = await fetch(`${BASE_IP}/users/${userId}/password`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPassword }),
                    credentials: 'include',
                });

                if (response.ok) {
                    toast.textContent = '변경 완료';
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 3000);
                } else {
                    const result = await response.json();
                    console.error('비밀번호 변경 실패:', result.message);
                    toast.textContent = '변경 실패';
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
            } catch (error) {
                console.error('비밀번호 변경 요청 중 오류:', error);
                toast.textContent = '비밀번호 변경 중 오류가 발생했습니다.';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        }
        
    });
    checkForm();
});
