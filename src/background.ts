interface PortConnections {
  [tabId: number]: chrome.runtime.Port;
}

const connections: PortConnections = {};

chrome.runtime.onConnect.addListener((port) => {
  // DevTools 패널로부터의 메시지 리스너
  const devToolsListener = (message: any, port: chrome.runtime.Port) => {
    // 패널로부터의 첫 메시지에는 탭 ID가 포함됩니다.
    if (message.name === "init") {
      connections[message.tabId] = port;
      // 연결이 설정되었음을 패널에 알립니다.
      port.postMessage({ type: "INIT_SUCCESS" });
      return;
    }

    // 패널의 다른 메시지들을 콘텐츠 스크립트로 중계합니다.
    if (connections[message.tabId]) {
      chrome.tabs.sendMessage(message.tabId, message);
    }
  };

  port.onMessage.addListener(devToolsListener);

  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(devToolsListener);
    // 연결 정리
    for (const tabId in connections) {
      if (connections[tabId] === port) {
        delete connections[tabId];
        break;
      }
    }
  });
});

// 콘텐츠 스크립트로부터의 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender) => {
  // 콘텐츠 스크립트의 메시지를 올바른 DevTools 패널로 중계합니다.
  if (sender.tab?.id && connections[sender.tab.id]) {
    connections[sender.tab.id].postMessage(message);
  }
  return true; // 비동기 응답이 전송될 수 있음을 나타냅니다.
});

/*
1. 아래부분 이해가 안감 무슨역할?
// 패널의 다른 메시지들을 콘텐츠 스크립트로 중계합니다.
    if (connections[message.tabId]) {
      chrome.tabs.sendMessage(message.tabId, message);
    }
devtools, panel은 어디서 보여지는건지? chrome 개발자도구 탭?
*/