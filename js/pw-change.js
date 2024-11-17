document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.change-form');
    const submitButton = document.querySelector('.blue-button'); // 제출 버튼 선택
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
    function checkFormValidity() {
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
            checkFormValidity();
        });
    }

    // 폼 제출 시 유효성 검사 수행
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let isValid = true;

        for (const input of Object.values(inputs)) {
            validateInput(input);
            if (input.helper.textContent !== '') {
                isValid = false;
            }
        }

        if (isValid) {
            // 폼 제출 시 토스트 메시지 표시
            toast.classList.add('show'); // 'show' 클래스 추가
            setTimeout(() => {
                toast.classList.remove('show'); // 'show' 클래스 제거
            }, 3000); // 3초 후에 숨김
        }


    });

});
