document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.purple-button');

  const inputs = {
    email: {
      element: document.getElementById('email'),
      helper: document.getElementById('email-helper')
    },
    pw: {
      element: document.getElementById('pw'),
      helper: document.getElementById('pw-helper')
    }
  };

  // 초기 상태에서 로그인 버튼을 비활성화
  loginButton.disabled = true;

  // 유효성 검사 함수
  function validateInput(input) {
    const { element, helper } = input;
    helper.textContent = '';

    if (element.id === 'email') {
      const emailValue = element.value;
      if (!emailValue) {
        helper.textContent = '*이메일을 입력해주세요';
      } else if (emailValue.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        helper.textContent = '*올바른 이메일 주소 형식을 입력해주세요. (예: example@naver.com)';
      }
    }

    const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
    if (element.id === 'pw') {
      const pwValue = element.value;
      if (!pwValue) {
        helper.textContent = '*비밀번호를 입력해주세요';
      } else if (!passwordCriteria.test(pwValue)) {
        helper.textContent = '*비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야합니다.';
      }
    }
  }

  // 유효성 검사 후 폼이 유효한지 확인하는 함수
  function checkForm() {
    let isFormValid = true;
    for (const input of Object.values(inputs)) {
      validateInput(input);
      if (input.helper.textContent !== '') {
        isFormValid = false;
      }
    }

    // 유효성 검사 결과에 따라 버튼 활성화/비활성화
    loginButton.disabled = !isFormValid;
  }
  

  // 입력이 변경될 때마다 유효성 검사 실행
  for (const input of Object.values(inputs)) {
    input.element.addEventListener('input', () => {
      validateInput(input);
      checkForm();
    });
  }

  loginButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = inputs.email.element.value;
    const password = inputs.pw.element.value;

    const data = {
      email,
      password
    };

    try {
      const response = await fetch('http://localhost:3001/guest/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      console.log('요청데이터:', data);
      const result = await response.json();
      console.log('Response:', result);

      if (response.ok) {
        if (result.data && result.data.userId) {
          alert('로그인 성공');
          const { userId } = result.data;
          console.log('userId:', userId); // userId 확인
          sessionStorage.setItem('userId', userId); // 로그인 후 유저 ID 저장
          window.location.href = './post-list.html';
        } else {
          console.error('응답에 userId 없음', result);
        }
        
      } else if (response.status === 401) {
          if (result.message === 'invalid_account'){
            inputs.email.helper.textContent = '*계정을 찾을 수 없습니다.';
            inputs.email.helper.style.display = 'block';
          } else if (result.message === 'invalid_password'){
              inputs.pw.helper.textContent = '*비밀번호가 올바르지 않습니다.';
            }
      } else if (response.status === 400){
        inputs.email.helper.textContent = '*이메일과 비밀번호를 입력해주세요.';
      } else alert('로그인 실패: 서버에서 문제가 발생했습니다.');
    }catch (error) {
        console.error('로그인 요청 중 오류 발생:', error);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
  });
});
