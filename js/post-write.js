document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.write-form');
    const submitButton = document.querySelector('.purple-button');

    let postImage = null;

    const inputs = {
        postTitle: {
            element: document.getElementById('postTitle'),
            helper: document.getElementById('title-helper')
        },
        content: {
            element: document.getElementById('content'),
            helper: document.getElementById('content-helper')
        },
        image: {
            element: document.getElementById('image')
        }
    };

    // 이미지 파일 읽기
    inputs.image.element.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                postImage = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 유효성 검사 함수
    function validateInput(input) {
        const { element, helper } = input;

        if (!helper) return;

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

    // 필수 폼에 입력이 되었는지 확인
    function checkForm() {
        let isFormValid = true;
        for (const input of Object.values(inputs)) {
            validateInput(input);
            if (input.helper && input.helper.textContent !== '') {
                isFormValid = false;
            }
        }
        submitButton.disabled = !isFormValid;
    }

    // 각 입력 필드에 이벤트 리스너 추가: 입력이 되면 헬퍼텍스트가 보이도록
    for (const input of Object.values(inputs)) {
        if (input.helper) {
            input.element.addEventListener('input', () => {
                validateInput(input);
                checkForm();
                input.helper.style.display = 'block';
            });
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        let valid = true;

        const data = {
            userId: sessionStorage.getItem('userId'),
            title: inputs.postTitle.element.value,
            content: inputs.content.element.value,
            postImage: postImage
        }

        try {
            const response = await fetch('http://localhost:3001/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (response.ok) {
                alert('게시글 작성 완료!');
                window.location.href = './post-list.html';
            } else {
                const result = await response.json();
                alert(`게시글 작성 실패: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    
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

    checkForm();
});
