const source = "msw-devtools-injected-script";

// 1. content-script로부터 요청을 받아 mswControl 객체의 함수를 실행
window.addEventListener("message", async (event) => {
  // 신뢰할 수 있는 소스(자기 자신)의 메시지만 처리
  if (
    event.source !== window ||
    !event.data ||
    !event.data.type ||
    event.data.source !== "msw-devtools-content-script"
  ) {
    return;
  }

  if (!window?.mswControl) {
    window.postMessage(
      {
        source,
        type: "MSW_NOT_FOUND",
        payload: null,
      },
      "*"
    );
    return;
  }

  const { type, payload } = event.data;

  switch (type) {
    case "GET_MSW_HANDLERS_REQUEST":
      if (window.mswControl?.getHandlers) {
        const handlers = window.mswControl.getHandlers();
        window.postMessage(
          { source, type: "GET_MSW_HANDLERS_RESPONSE", payload: handlers },
          "*"
        );
      }
      break;
    case "TOGGLE_HANDLER_REQUEST":
      const { id, enabled: handlerEnabled } = payload;
      if (handlerEnabled) {
        window.mswControl.enableHandler(id);
      } else {
        window.mswControl.disableHandler(id);
      }
      window.postMessage(
        {
          source,
          type: "TOGGLE_HANDLER_RESPONSE",
          payload: { id, enabled: handlerEnabled },
        },
        "*"
      );
      break;
    case "TOGGLE_ALL_HANDLER_REQUEST":
      const { enabled: allEnabled } = payload;
      if (allEnabled) {
        window.mswControl.enableAllHandlers();
      } else {
        window.mswControl.disableAllHandlers();
      }
      break;
    case "TOGGLE_GROUP_HANDLER_REQUEST":
      const { groupName, enabled: groupEnabled } = payload;
      if (groupEnabled) {
        window.mswControl.enableGroup(groupName);
      } else {
        window.mswControl.disableGroup(groupName);
      }
      break;
    default:
      break;
  }

  return;
});

// 2. MSW 상태 변경 이벤트를 감지하여 content-script로 전달
// (MSWController의 reinitialize 메서드는 'mswStateChanged' 이벤트를 발생시킴)
window.addEventListener("mswStateChanged", () => {
  window.postMessage({ source, type: "MSW_STATE_CHANGED_EVENT" }, "*");
  return;
});
