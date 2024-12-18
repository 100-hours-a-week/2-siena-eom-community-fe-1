document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.write-form');
    const submitButton = document.querySelector('.purple-button');
    const BASE_IP = 'http://3.39.237.226:3001';
    // const BASE_IP = 'localhost:3001';

    let imagePath = null;

    const userId = sessionStorage.getItem('userId');
            if (!userId) {
                alert('로그인이 필요합니다.');
                window.location.href = './login.html';
                return;
            }

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

    // URL을 기반으로 작성/수정 구분
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId'); // postId가 있으면 수정 모드

    if (postId) {
        // 수정 모드: 기존 데이터 로드
        try {
            const response = await fetch(`${BASE_IP}/posts/${postId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const post = result.data;

            // 기존 데이터 폼에 채우기
            inputs.postTitle.element.value = post.title;
            inputs.content.element.value = post.content;
            postImage = post.postImage || null;

            checkForm(); // 폼 상태 확인
        } catch (error) {
            console.error('게시글 데이터를 불러오는 중 오류 발생:', error);
            alert('게시글 데이터를 불러오지 못했습니다.');
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            title: inputs.postTitle.element.value,
            content: inputs.content.element.value,
            postImage: imagePath,
        }

        const url = postId
            ? `${BASE_IP}/posts/${postId}` // 수정 URL
            : '${BASE_IP}/posts'; // 작성 URL

        const method = postId ? 'PATCH' : 'POST'; // 작성이면 POST, 수정이면 PATCH

        try {
            const postImageFile = inputs.image.element.files[0];
            if (postImageFile) {
                const formData = new FormData();
                formData.append('postImage', postImageFile);

                const uploadResponse = await fetch (`${BASE_IP}/posts/${postId || 'new'}/postImage`,
                    {
                        method: 'POST',
                        body: formData,
                });
                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    imagePath = uploadResult.data.filePath;
                    console.log('이미지 업로드 성공:', imagePath);
                    data.postImage = imagePath;
                } else {
                    console.error('이미지 업로드 실패:', await uploadResponse.text());
                    alert('게시글 사진 업로드 실패');
                    return;
                }

            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (response.ok) {
                postId ? 
                    location.href = `./post-show.html?postId=${postId}` // 수정 시 상세 페이지로 이동
                    : window.location.href = './post-list.html'; // 작성 시 게시글 목록으로이동
                    
            } else {
                const result = await response.json();
                alert(`작업이 실패하였습니다.: ${result.message}`);
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
