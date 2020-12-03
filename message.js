const iframeMessageManager = {
  /**
  * 初始化监听函数
  */
  init: () => {
    if (window.temp_response_iframe_all_functions) {
      return;
    }
    window.addEventListener('message', (e) => {
      // 获取消息识别号
      const { serialId, targetDomain } = e.data;
      // 有配置回调函数
      if (serialId && targetDomain
        && targetDomain === window.location.hostname
        && window.temp_response_iframe_all_functions
        && window.temp_response_iframe_all_functions[serialId]) {
        // 执行回调
        window.temp_response_iframe_all_functions[serialId](e.data);
        // 删除回调
        window.temp_response_iframe_all_functions[serialId] = undefined;
      }
    }, false);
    window.temp_response_iframe_all_functions = {};
  },
  /**
  * 提供跨域的公共能方法
  */
  sendFrameMessage: (data, toDomain, callback) => {
    // 判断是否初始化
    if (!window.temp_response_iframe_all_functions) {
      this.init();
    }
    // 创建流水号
    const serialId = `sendFramMessage${Date.now()}`;
    const messageData = {
      serialId,
      originDomain: window.location.hostname,
      targetDomain: toDomain,
      data,
    };
    // 创建iframe元素
    if (!this.iframe) {
      const iframeHtml = '<div style="overflow: hidden;height: 1px;width: 1px;position: absolute;top: -1px;"><iframe id="ifr_localStorage" src=""></iframe></div>';
      document.body.insertAdjacentHTML('beforeend', iframeHtml);
      this.iframe = document.querySelector('#ifr_localStorage');
    }
    // 保存回调方法
    if (callback) {
      window.temp_response_iframe_all_functions[serialId] = callback;
    }
    // 发送消息
    if (this.iframe.toDomain !== toDomain) {
      this.iframe.toDomain = toDomain;
      this.iframe.Attributes.src = `https://${toDomain}/stemp.html`;
      if (this.iframe.attachEvent) {
        this.iframe.attachEvent('onload', () => {
          // iframe加载完成后你需要进行的操作
          this.iframe.contentWindow.postMessage(messageData, '*.baidu.com');
          console.log(`${window.location.hostname} send message data:`, messageData);
        });
      } else {
        this.iframe.onload = () => {
          // iframe加载完成后你需要进行的操作
          this.iframe.contentWindow.postMessage(messageData, '*.baidu.com');
          console.log(`${window.location.hostname} send message data:`, messageData);
        };
      }
    } else {
      this.iframe.contentWindow.postMessage(messageData, '*.baidu.com');
      console.log(`${window.location.hostname} send message data:`, messageData);
    }
  },
};

export default iframeMessageManager;
