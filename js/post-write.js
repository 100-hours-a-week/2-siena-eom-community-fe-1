document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('write-form');
    const submitButton = document.querySelector('.purple-button');

    const inputs = {
        postTitle: {
            element: document.getElementById('postTitle'),
            helper: document.getElementById('title-helper')
        },
        content: {
            element: document.getElementById('content'),
            helper: document.getElementById('content-helper')
        }
    };

    // 유효성 검사 함수
    function validateInput(input) {
        const { element, helper } = input;
        helper.textContent = ''; // 헬퍼 메시지 초기화

        if (element.id === 'postTitle') {
            const titleValue = element.value;
            if (!titleValue) {
                helper.textContent = '*제목을 입력해 주세요.';
            } else if (titleValue.length > 26) {
                helper.textContent = '*제목은 최대 26자까지 작성 가능합니다.';
            }
        }

        if (element.id === 'content') {
            const contentValue = element.value;
            if (!contentValue) {
                helper.textContent = '*내용을 입력해 주세요.';
            }
        }
    };

    // 모든 폼에 입력이 되었는지 확인
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

    // 각 입력 필드에 이벤트 리스너 추가: 입력이 되면 헬퍼텍스트가 보이도록
    for (const input of Object.values(inputs)) {
        input.element.addEventListener('input', () => {
            validateInput(input);
            checkForm();
            input.helper.style.display = 'block';
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 기본 제출 동작 방지
        let valid = true;
    
        // 각 입력 필드에 대해 유효성 검사 수행
        for (const input of Object.values(inputs)) {
            validateInput(input);
            if (input.helper.textContent !== '') {
                valid = false;
            }
        }

        if (!submitButton.disabled) {
            form.submit(); 
        }
    });
    for (const input of Object.values(inputs)) {
        input.helper.style.display = 'none';  // 헬퍼 텍스트를 숨김
    }

    checkForm();
});
