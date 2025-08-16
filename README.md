# 중고거래 PWA 앱

React와 Firebase를 사용한 중고거래 PWA(Progressive Web App)입니다.

## 주요 기능

### 기존 기능
- 📚 중고 교재 거래
- 🔍 게시물 검색
- 👤 사용자 프로필 관리
- 📱 PWA 지원
- 🖼️ 이미지 업로드 및 크롭 기능

### 새로 추가된 채팅 기능
- 💬 실시간 채팅
- 👥 1:1 채팅방
- 🔍 사용자 검색
- 📱 반응형 채팅 UI
- ⚡ 실시간 메시지 동기화

## 기술 스택

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **실시간 통신**: Firebase Firestore 실시간 리스너
- **상태 관리**: React Hooks
- **테스팅**: Jest, React Testing Library

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Firebase 설정
Firebase 프로젝트를 생성하고 `src/config/firebase.ts` 파일에 설정을 추가하세요.

### 3. 개발 서버 실행
```bash
npm start
```

### 4. Firebase 에뮬레이터 실행 (선택사항)
```bash
npm run emulators
```

## 채팅 기능 사용법

### 1. 채팅 페이지 접속
- 홈페이지에서 "채팅하기" 버튼 클릭
- 또는 `/chat` 경로로 직접 접속

### 2. 새 채팅 시작
- 우하단의 "+" 버튼 클릭
- 사용자 검색
- 원하는 사용자 선택하여 채팅방 생성

### 3. 메시지 전송
- 채팅창 하단의 입력창에 메시지 입력
- Enter 키 또는 전송 버튼으로 메시지 전송

## 프로젝트 구조

```
src/
├── components/
│   ├── chat/           # 채팅 관련 컴포넌트
│   │   ├── ChatWindow.tsx
│   │   └── ChatRoomList.tsx
│   └── ...
├── pages/
│   ├── ChatPage.tsx    # 메인 채팅 페이지
│   └── ...
├── services/
│   ├── chatService.ts  # 채팅 서비스 로직
│   └── ...
├── types/
│   ├── chat.ts         # 채팅 관련 타입 정의
│   └── ...
└── ...
```

## Firebase 설정

### Firestore 규칙
채팅 기능을 위한 보안 규칙이 `firestore.rules`에 포함되어 있습니다:

```javascript
// 채팅방 컬렉션
match /chatRooms/{roomId} {
  allow read: if request.auth != null && 
    request.auth.uid in resource.data.participants;
  allow create: if request.auth != null && 
    request.auth.uid in request.resource.data.participants;
  allow update: if request.auth != null && 
    request.auth.uid in resource.data.participants;
}

// 메시지 컬렉션
match /messages/{messageId} {
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/chatRooms/$(resource.data.roomId)) &&
    request.auth.uid in get(/databases/$(database)/documents/chatRooms/$(resource.data.roomId)).data.participants;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.senderId &&
    exists(/databases/$(database)/documents/chatRooms/$(request.resource.data.roomId)) &&
    request.auth.uid in get(/databases/$(database)/documents/chatRooms/$(request.resource.data.roomId)).data.participants;
}
```

### 인덱스 설정
`firestore.indexes.json`에 채팅 기능을 위한 인덱스가 설정되어 있습니다.

## 테스팅

### 채팅 서비스 테스트
```bash
npm test -- --testPathPattern=chatService
```

### 채팅 컴포넌트 테스트
```bash
npm test -- --testPathPattern=ChatWindow
```

## 배포

### Firebase 배포
```bash
npm run build
firebase deploy
```

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

