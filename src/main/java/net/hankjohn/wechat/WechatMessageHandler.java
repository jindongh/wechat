package net.hankjohn.wechat;

public class WechatMessageHandler {
    public WechatResponse handleMessage(WechatMessage message) {
        // TODO
        WechatResponse response = new WechatResponse(message);
        return response;
    }
}
