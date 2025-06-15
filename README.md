# MSW DevTools Controller

[English](#english) | [한국어](#korean)

<a id="english"></a>

## English

This tool is a Chrome DevTools extension that serves as the official Chrome panel implementation of the `msw-controller` library. It allows you to dynamically control MSW (Mock Service Worker) handlers in real-time without refreshing the browser, significantly improving frontend development and testing productivity.

### Key Features

- **Custom Panel**: Adds a dedicated 'MSW Controls' tab to the developer tools.
- **Grouped UI**: Displays handlers grouped by API, with collapsible sections.
- **Individual Handler Control**: Toggle individual handlers on/off using switches.
- **Real-time Code Sync**: Automatically reflects changes in the panel UI when handler files are modified and saved (HMR).

### Installation

#### Chrome Web Store Installation

1. Search for "MSW DevTools Controller" in the Chrome Web Store.
2. Click "Add to Chrome" to install.

### Relationship with msw-controller Library

This Chrome extension is the official Chrome panel implementation of the `msw-controller` library. The `msw-controller` library provides core functionality for dynamically controlling MSW handlers, while this extension provides a user-friendly UI layer in Chrome DevTools.

#### Installing msw-controller Library

```bash
npm install msw-controller
```

For library usage and detailed API documentation, please refer to the [msw-controller GitHub repository](https://github.com/your-username/msw-controller).

### Usage

1. Click on the **"MSW Controls"** tab in the developer tools.
2. The panel automatically loads the current page's MSW handlers.
3. Use the toggle switches to enable or disable handlers as needed. Changes are applied immediately.

---

<a id="korean"></a>

## 한국어

이 도구는 `msw-controller` 라이브러리의 Chrome 패널 구현체로, 브라우저를 새로고침하지 않고도 실시간으로 API 모킹을 켜고 끌 수 있어, 프론트엔드 개발 및 테스트 생산성을 크게 향상시킬 수 있습니다.

### 주요 기능

- **커스텀 패널**: 개발자 도구에 'MSW Controls'라는 전용 탭을 추가합니다.
- **그룹화된 UI**: 핸들러를 API 그룹별로 나누어 보여주며, 각 그룹은 접고 펼 수 있습니다.
- **개별 핸들러 제어**: 각 핸들러 옆의 토글 스위치를 통해 개별적으로 모킹을 활성화/비활성화할 수 있습니다.
- **실시간 코드 동기화**: 개발자가 로컬에서 핸들러 파일을 수정하고 저장(HMR)하면, 패널 UI에 변경사항이 자동으로 반영됩니다.

### 설치 및 실행 방법

#### Chrome Web Store에서 설치

1. Chrome Web Store에서 "MSW DevTools Controller" 확장 프로그램을 검색합니다.
2. "Chrome에 추가" 버튼을 클릭하여 설치합니다.

### msw-controller 라이브러리와의 관계

이 Chrome 확장 프로그램은 `msw-controller` 라이브러리의 공식 Chrome 패널 구현체입니다. `msw-controller`는 MSW 핸들러를 동적으로 제어하기 위한 핵심 기능을 제공하는 라이브러리이며, 이 확장 프로그램은 그 기능을 Chrome 개발자 도구에서 사용하기 쉽게 만든 UI 레이어입니다.

#### msw-controller 라이브러리 설치

```bash
npm install msw-controller
```

라이브러리 사용 방법과 자세한 API 문서는 [msw-controller GitHub 저장소](https://github.com/your-username/msw-controller)를 참조하세요.

### 사용법

1. 상단 탭 목록에서 **"MSW Controls"** 탭을 찾아 클릭합니다.
2. 패널이 자동으로 현재 페이지의 MSW 핸들러 목록을 불러옵니다.
3. 토글 스위치를 클릭하여 원하는 핸들러를 켜거나 끌 수 있습니다. 변경 사항은 즉시 적용됩니다.
