document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.purple-button');
  const profileImage = document.getElementById('profile-image');
  const profileInput = document.getElementById('profile');

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

  let isEmailValid = false;
  let isNicknameValid = false;

  inputs.profile.helper.textContent = '*프로필 사진을 선택하지 않으시면 기본 이미지로 설정됩니다.';
  inputs.profile.helper.style.display = 'block';

  // 프로필 이미지를 클릭하면 파일 선택 창을 엶
  profileImage.addEventListener('click', () => profileInput.click());

  // 파일을 선택하면 미리보기 이미지 업데이트
  profileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              profileImage.src = e.target.result; // 선택한 이미지로 업데이트
              inputs.profile.helper.style.display = 'none';
          };
          reader.readAsDataURL(file);
      }
  });

  // 유효성 검사 및 중복 확인 통합
  async function validateAndCheck(input) {
      const { element, helper } = input;

      if (element.id === 'email') {
          const emailValue = element.value.trim();
          if (!emailValue) {
              helper.textContent = '*이메일을 입력해주세요';
              helper.style.color = 'red';
              isEmailValid = false;
          } else if (emailValue.length < 5 || !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(emailValue)) {
              helper.textContent = '*올바른 이메일 주소 형식을 입력해주세요.';
              helper.style.color = 'red';
              isEmailValid = false;
          } else {
              // 유효성 검사 통과후에 중복 확인 요청
              try {
                  const response = await fetch(`http://localhost:3001/guest/emailValid?email=${encodeURIComponent(emailValue)}`, {
                      method: 'GET',
                  });

                  const result = await response.json();

                  if (response.ok && result.message === 'email_available') {
                      helper.textContent = '*사용 가능한 이메일입니다.';
                      helper.style.color = 'green';
                      isEmailValid = true;
                  } else if (response.status === 409) {
                      helper.textContent = '*이미 사용 중인 이메일입니다.';
                      helper.style.color = 'red';
                      isEmailValid = false;
                  } else {
                      helper.textContent = '*이메일 확인 중 문제가 발생했습니다.';
                      helper.style.color = 'red';
                      isEmailValid = false;
                  }
              } catch (error) {
                  console.error('이메일 중복 확인 요청 중 오류 발생:', error);
                  helper.textContent = '*네트워크 오류가 발생했습니다.';
                  helper.style.color = 'red';
                  isEmailValid = false;
              }
          }
      }

      if (element.id === 'nickname') {
          const nicknameValue = element.value.trim();
          if (!nicknameValue) {
              helper.textContent = '*닉네임을 입력해주세요';
              helper.style.color = 'red';
              isNicknameValid = false;
          } else if (/\s/.test(nicknameValue) || nicknameValue.length > 10) {
              helper.textContent = '*닉네임은 최대 10자까지 작성 가능하고 띄어쓰기 없이 입력해주세요.';
              helper.style.color = 'red';
              isNicknameValid = false;
          } else {
              // 유효성 검사 통과후에 중복 확인 요청
              try {
                  const response = await fetch(`http://localhost:3001/guest/nicknameValid?nickname=${encodeURIComponent(nicknameValue)}`, {
                      method: 'GET',
                  });

                  const result = await response.json();

                  if (response.ok && result.message === 'nickname_available') {
                      helper.textContent = '*사용 가능한 닉네임입니다.';
                      helper.style.color = 'green';
                      isNicknameValid = true;
                  } else if (response.status === 409) {
                      helper.textContent = '*이미 사용 중인 닉네임입니다.';
                      helper.style.color = 'red';
                      isNicknameValid = false;
                  } else {
                      helper.textContent = '*닉네임 확인 중 문제가 발생했습니다.';
                      helper.style.color = 'red';
                      isNicknameValid = false;
                  }
              } catch (error) {
                  console.error('닉네임 중복 확인 요청 중 오류 발생:', error);
                  helper.textContent = '*네트워크 오류가 발생했습니다.';
                  helper.style.color = 'red';
                  isNicknameValid = false;
              }
          }
      }

      if (element.id === 'pw') {
          const pwValue = element.value.trim();
          const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
          if (!pwValue) {
              helper.textContent = '*비밀번호를 입력해주세요';
              helper.style.color = 'red';
          } else if (!passwordCriteria.test(pwValue)) {
              helper.textContent = '*비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 포함해야 합니다.';
              helper.style.color = 'red';
          } else {
              helper.textContent = '';
          }
      }

      if (element.id === 'pwck') {
          const pwValue = inputs.pw.element.value.trim();
          const pwckValue = element.value.trim();
          if (!pwckValue) {
              helper.textContent = '*비밀번호를 한번 더 입력해주세요';
              helper.style.color = 'red';
          } else if (pwValue !== pwckValue) {
              helper.textContent = '*비밀번호가 일치하지 않습니다.';
              helper.style.color = 'red';
          } else {
              helper.textContent = '';
          }
      }
      checkForm();
  }

  // 폼 상태 확인 함수
  function checkForm() {
      let isFormValid = true;

      for (const inputKey in inputs) {
          if (inputKey !== 'profile') {
              const input = inputs[inputKey];
              if (input.helper.textContent !== '' && input.helper.style.color === 'red') {
                  isFormValid = false;
              }
          }
      }
      submitButton.disabled = !(isFormValid && isEmailValid && isNicknameValid);
  }

  // 입력 이벤트 등록
  for (const inputKey in inputs) {
      if (inputKey !== 'profile') {
          const input = inputs[inputKey];
          input.element.addEventListener('input', () => validateAndCheck(input));
      }
  }

  submitButton.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        let profilePath = 'http://localhost:3001/images/default-profile.png';

        // 프로필 사진 업로드 처리
        if (profileInput.files[0]) {
            const formData = new FormData();
            formData.append('profile', profileInput.files[0]); // 파일 추가

            const uploadResponse = await fetch('http://localhost:3001/guest/profile', {
                method: 'POST',
                body: formData, // FormData로 전송
            });

            if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                profilePath = uploadResult.data.filePath; // 업로드된 파일 경로 가져오기
            } else {
                console.error('Profile upload failed:', await uploadResponse.text());
                alert('프로필 사진 업로드 실패. 기본 이미지가 사용됩니다.');
            }
        }

        const data = {
            email: inputs.email.element.value,
            password: inputs.pw.element.value,
            nickname: inputs.nickname.element.value,
            profile: profilePath,
        };

        const response = await fetch('http://localhost:3001/guest/signup', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
          });

          if (response.ok) {
              const result = await response.json();
              console.log('Signup success:', result);
              alert('회원가입 성공!');
              window.location.href = './login.html';
          } else {
              const errorText = await response.text();
              console.error(`Signup failed: ${response.status}`, errorText);
              alert(`회원가입 실패: ${response.status}`);
          }
      } catch (error) {
          console.error('Error:', error);
      }
  });
});
