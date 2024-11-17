document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.querySelector('.purple-button');
    const profileImage = document.getElementById('profile-image');
    const profileInput = document.getElementById('profile');
    const emailCheck = document.getElementById("email-check")
    
  
    const inputs = {
      profile: {
        element: profileInput,
        helper: document.getElementById('profile-helper')
      },
      email: {
        element: document.getElementById('email'),
        helper: document.getElementById('email-helper')
      },
      pw: {
        element: document.getElementById('pw'),
        helper: document.getElementById('pw-helper')
      },
      pwck: {
        element: document.getElementById('pwck'),
        helper: document.getElementById('pwck-helper')
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

    //중복확인 버튼
    emailCheck.addEventListener('click', () => {
      //중복확인 로직 작성
    });


    // 초기 상태에서 회원가입 버튼을 비활성화
    submitButton.disabled = true;
  
    // 유효성 검사 함수
    function validateInput(input) {
      const { element, helper } = input;
      helper.textContent = '';
  
      if (element.id === 'email') {
        const emailValue = element.value;
        if (!emailValue) {
          helper.textContent = '*이메일을 입력해주세요';
        } else if (emailValue.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          helper.textContent = '*올바른 이메일 주소 형식을 입력해주세요.';
        }
      }
      if (element.id === 'pw') {
        const pwValue = element.value;
        const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
        if (!pwValue) {
          helper.textContent = '*비밀번호를 입력해주세요';
        } else if (!passwordCriteria.test(pwValue)) {
          helper.textContent = '*비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 포함해야합니다.';
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
      if (element.id === 'nickname') {
        const nicknameValue = element.value;
        if (!nicknameValue) {
          helper.textContent = '*닉네임을 입력해주세요';
        } else if (/\s/.test(nicknameValue) || nicknameValue.length > 10) {
          helper.textContent = '*닉네임은 최대 10자까지 작성 가능하고 띄어쓰기 없이 입력해주세요.';
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
  
    checkForm();
  });
  