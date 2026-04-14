const script = document.createElement("script");
script.src = chrome.runtime.getURL("src/inpage/index.js");
script.type = "module";
(document.head || document.documentElement).appendChild(script);
script.remove();

window.addEventListener("message", async (event) => {
  if (event.source !== window || event.data?.target !== "tipswallet-content") return;

  const response = await chrome.runtime.sendMessage({
    action: "provider:request",
    payload: event.data.payload
  });

  window.postMessage(
    {
      target: "tipswallet-inpage",
      payload: response
    },
    "*"
  );
});
