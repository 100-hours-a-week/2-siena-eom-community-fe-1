##### 2-siena-eom-community-fe-1

## 💬 WeMessage
<p align="center"><img src="https://github.com/user-attachments/assets/e9398e03-2034-4861-bfe2-367171cb8478"></p>

### 🐮🐶 프로젝트 소개
> Post whatever you want!

`WeMessage`는 사용자가 자유롭게 게시글을 작성하고 다른 사용자와 소통할 수 있는 간단한 커뮤니티 웹 애플리케이션입니다.

### 🗓️ 개발 기간 
2024.11 ~

### 🛠️ 주요 기능

🗣️ **유저 관리**
```
- 회원가입
- 로그인
- 프로필 수정 (프로필사진, 닉네임)
- 비밀번호 변경
```
✏️ **게시글 관리**
```
- 게시글 작성/수정/삭제
- 게시글 좋아요
- 게시글 조회수 집계
- 게시글 댓글 조회
```
💭 **댓글 관리**
```
- 댓글 작성/수정/삭제
```

### 🎥 시연 영상
주요기능 위주로 녹화하였습니다.
https://github.com/user-attachments/assets/677d0f58-0c7e-4bd0-845a-652c14993370

### 📚 기술 스택
<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"><img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"><img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">


### 🚀 실행 방법
1. git clone

    ```bash
    git clone https://github.com/100-hours-a-week/2-siena-eom-community-fe-1.git
    ````

2. 의존성 설치 `npm install`

3. 실행 `node index.js`

4.  접속 `http://localhost:8080`

**백엔드 서버와 함께 실행시켜야 정상적인 동작이 가능합니다**

### 📁 파일 구조
```
2-SIENA-EOM-COMMUNITY-FE-1/
├── css                      # .css 파일
│   ├── global.css
│   ├── login.css
│   ├── post-list.css
│   ├── post-show.css
│   ├── post-write.css
│   ├── profile-edit.css
│   └── signup.css
├── data                     # (BE, DB 연결 전) JSON 데이터
├── html                     # .html 파일
│   ├── login.html
│   ├── post-edit.html
│   ├── post-list.html
│   ├── post-show.html
│   ├── post-write.html
│   ├── profile-edit.html
│   ├── pw-change.html
│   └── signup.html
├── images                   # 이미지 파일(기본 아이콘 등)
├── js                       # .js 파일
│   ├── header.js
│   ├── login.js
│   ├── post-list.js
│   ├── post-show.js
│   ├── post-write.js
│   ├── profile-edit.js
│   ├── pw-change.js
│   └── signup.js
├── index.js                 # 엔트리 포인트
├── package.json             # 프로젝트 설정 파일
└── README.md                # 프로젝트 설명 파일
```

### [⚙️ 백엔드 레포지토리](https://github.com/100-hours-a-week/2-siena-eom-community-be.git)

![Image](https://github.com/user-attachments/assets/d2cf7ba9-a6f5-4fbc-a821-13e162914138)