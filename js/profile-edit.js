document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.edit-form'); // 폼 요소 선택
    const submitButton = document.querySelector('.purple-button');
    const profileImage = document.getElementById('profile-image');
    const profileInput = document.getElementById('profile');
    const toast = document.getElementById('toast');

    // 헬퍼텍스트 기능을 위해 입력 필드와 헬퍼 텍스트 매핑
    const inputs = {
        profile: {
            element: document.getElementById('profile'),
            helper: document.getElementById('profile-helper')
        },
        nickname: {
            element: document.getElementById('nickname'),
            helper: document.getElementById('nickname-helper')
        }
    };

    inputs.profile.helper.textContent = '*프로필 사진을 선택하지 않으시면 기본 이미지로 설정됩니다.';
    inputs.profile.helper.style.display = 'block';

    // 프로필 이미지를 클릭하면 파일 선택 창을 엶
    profileImage.addEventListener('click', () => {
        profileInput.click();
    });

    // 파일을 선택하면 미리보기 이미지 업데이트
    profileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage.src = e.target.result; // 선택한 이미지로 업데이트
                inputs.profile.helper.style.display = 'none'; // 파일 선택 시 헬퍼 메시지 숨김
            };
            reader.readAsDataURL(file);
        }
    });

    // 유효성 검사 함수
    function validateInput(input) {
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
            }
        }
    }

    // 유효성 검사 확인 함수
    function checkForm() {
        let isFormValid = true;
        for (const inputKey in inputs) {
          if (inputKey !== 'profile'){
            const input = inputs[inputKey];
            validateInput(input);
            if (input.helper.textContent !== '') {
              isFormValid = false;
            }
          }
        }
        submitButton.disabled = !isFormValid;
      }

    // 입력이 변경될 때마다 유효성 검사
    for (const inputKey in inputs) {
      
        if (inputKey !== 'profile'){
          const input = inputs[inputKey];
          input.element.addEventListener('input', () => {
            validateInput(input);
            checkForm();
            input.helper.style.display = 'block';
          });
        }
    }

    // 하나의 submit 이벤트 리스너로 통합
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 기본 제출 동작 방지
        let isValid = true;

        // 각 입력 필드에 대해 유효성 검사 수행
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

    // 모든 입력 필드에 대한 초기 헬퍼 텍스트 표시
    checkForm();

    
});

// 모달 열기
function showConfirmModal() {
    document.getElementById("confirmModal").style.display = "flex";
}

// 모달 닫기
function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}

// 확인 버튼 클릭 시 실행되는 함수
function confirmDeletion() {
    // login.html로 이동
    window.location.href = "/login.html";
}
